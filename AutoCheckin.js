// Auto.js 自动签到脚本：数字FAFU
// 需要开启无障碍服务和悬浮窗权限
// Version 1.0 
// 修复了等待时间过短导致无法签到问题

// 全局超时与延迟设置（可根据设备/网络情况调整）
const DEFAULT_TIMEOUT = 10000;    // 默认等待某个文本出现的最大时间（毫秒）
const DEFAULT_POLL = 800;         // 每次轮询间隔（毫秒）
const AFTER_CLICK_SLEEP = 1800;   // 点击后等待 UI 响应的时间（毫秒）

// 简单封装 sleep，便于统一管理与替换
function sleepMs(ms){ sleep(ms); }

// 等待界面上出现指定文本（支持 text 和 textContains）
// textStr: 要等待的文本；timeout: 最大等待时间；poll: 轮询间隔
// 返回 true 表示找到了，false 表示超时未找到
function waitForText(textStr, timeout = DEFAULT_TIMEOUT, poll = DEFAULT_POLL){
    let elapsed = 0;
    while (elapsed < timeout){
        if (textContains(textStr).exists() || text(textStr).exists()) return true;
        sleepMs(poll);
        elapsed += poll;
    }
    return false;
}

// 等待当前前台包名为指定包（可选用来确保已切到目标应用）
// pkg: 包名字符串，例如 "cn.edu.fafu.iportal"
function waitForPackage(pkg, timeout = 15000, poll = 500){
    let elapsed = 0;
    while (elapsed < timeout){
        if (currentPackage() === pkg) return true;
        sleepMs(poll);
        elapsed += poll;
    }
    return false;
}

// 安全点击函数：优先尝试 node.click()（更稳），失败则用节点坐标 click()
// node: AccessibilityNodeInfo 对象或类似对象
// 返回 true 表示点击已发出（并等待了 AFTER_CLICK_SLEEP），false 表示无法点击
function safeClick(node){
    if (!node) return false;
    try {
        if (node.click && node.click()) {
            sleepMs(AFTER_CLICK_SLEEP);
            return true;
        }
    } catch(e){ }
    try {
        let r = node.bounds();
        if (r) {
            click(r.centerX(), r.centerY());
            sleepMs(AFTER_CLICK_SLEEP + 300);
            return true;
        }
    } catch(e){ }
    return false;
}

// 等待指定文本出现并点击（包含日志与超时处理）
// textStr: 要点击的文本；timeout: 等待该文本的最长时间
// 返回 true 表示点击成功，false 表示失败或超时
function waitForTextAndClick(textStr, timeout = DEFAULT_TIMEOUT){
    toast("等待: " + textStr);                           // 屏幕提示
    log("等待: " + textStr + " (timeout=" + timeout + "ms)");
    if (!waitForText(textStr, timeout)) {
        toast("超时未出现: " + textStr);
        log("超时未出现: " + textStr);
        sleepMs(1000);                                  // 给用户看提示并避免太快返回
        toast("请检查是否已签到！");
        log("请检查是否已签到！");
        return false;
    }

    // 优先通过精确 text() 找节点，找不到再用 textContains()
    let node = text(textStr).findOnce();
    if (!node) node = textContains(textStr).findOnce();

    if (!node) {
        toast("找到文本但未取得节点对象: " + textStr);
        log("找到文本但未取得节点对象: " + textStr);
        return false;
    }

    // 用 safeClick 来点击
    let clicked = safeClick(node);
    if (!clicked) {
        toast("点击失败: " + textStr);
        log("点击失败: " + textStr);
        return false;
    }

    sleepMs(1200); // 额外短等待，确保 UI 更新
    return true;
}

// 寻找并点击第一个出现的“签到”按钮（带轮询重试）
// timeout: 找到按钮的最长时间
function clickFirstSign(timeout = DEFAULT_TIMEOUT){
    toast("寻找第一个 签到 按钮...");
    let elapsed = 0, poll = DEFAULT_POLL;
    while (elapsed < timeout){
        let node = text("签到").findOnce() || textContains("签到").findOnce();
        if (node){
            if (safeClick(node)) {
                toast("点击 签到 成功");
                return true;
            }
        }
        sleepMs(poll);
        elapsed += poll;
    }
    toast("未找到 签到 按钮（超时）");
    return false;
}

// 点击指定文字下方的按钮（通过坐标偏移）
// textStr: 参考文字，yOffset: 在文字下方偏移多少像素去点击（可调）
function clickUnderText(textStr, yOffset = 60, timeout = DEFAULT_TIMEOUT){
    toast("等待并点击 " + textStr + " 下方按钮");
    if (!waitForText(textStr, timeout)) return false;
    let node = text(textStr).findOnce() || textContains(textStr).findOnce();
    if (!node) return false;
    try {
        let b = node.bounds();
        click(b.centerX(), b.bottom + yOffset);   // 在文字下方点击
        sleepMs(AFTER_CLICK_SLEEP + 300);
        return true;
    } catch(e){
        return false;
    }
}

// 提交签到并尝试点击确认弹窗（若存在）
function submitAndConfirm(){
    if (!waitForTextAndClick("提交签到", DEFAULT_TIMEOUT)) {
        return false
    }
    if (waitForText("确认", 8000)) {
        waitForTextAndClick("确认", 8000);
    }
    return true;
}

// 主流程：按步骤打开 APP -> 学生管理 -> 点击第一个签到 -> 选择未签到/已请假 -> 提交
function main(){
    toast("开始自动签到");
    log("开始自动签到");

    launchApp("数字FAFU");   // 根据你设备上安装的应用名称启动（或改为 launchPackage("包名")）
    sleepMs(6000);           // 启动后等待应用 UI 完全加载

    if (!waitForTextAndClick("学生管理", 30000)) {
        toast("步骤失败：学生管理");
        return;
    }

    if (!clickFirstSign(30000)) {
        toast("步骤失败：点击签到");
        return;
    }

    // 优先点击“签到状态：未签到”，否则尝试点击“已请假”下方或“未签到”
    if (waitForText("签到状态：未签到", 8000)) {
        waitForTextAndClick("签到状态：未签到", 8000);
        sleepMs(1200);
    } else {
        if (!clickUnderText("已请假", 60, 10000)) {
            if (!waitForTextAndClick("未签到", 8000)) {
                toast("未找到 未签到 或 已请假 下方按钮");
                return;
            }
        }
    }

    if (!submitAndConfirm()) {
        toast("提交/确认步骤失败");
        return;
    }

    toast("签到流程尝试完成");
    log("签到流程尝试完成");
}

main();
