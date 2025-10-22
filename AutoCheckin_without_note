// 无注释版
// Version 1.0
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_POLL = 800;
const AFTER_CLICK_SLEEP = 1800;

function sleepMs(ms){ sleep(ms); }

function waitForText(textStr, timeout = DEFAULT_TIMEOUT, poll = DEFAULT_POLL){
    let elapsed = 0;
    while (elapsed < timeout){
        if (textContains(textStr).exists() || text(textStr).exists()) return true;
        sleepMs(poll);
        elapsed += poll;
    }
    return false;
}

function waitForPackage(pkg, timeout = 15000, poll = 500){
    let elapsed = 0;
    while (elapsed < timeout){
        if (currentPackage() === pkg) return true;
        sleepMs(poll);
        elapsed += poll;
    }
    return false;
}

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

function waitForTextAndClick(textStr, timeout = DEFAULT_TIMEOUT){
    toast("等待: " + textStr);
    log("等待: " + textStr + " (timeout=" + timeout + "ms)");
    if (!waitForText(textStr, timeout)) {
        toast("超时未出现: " + textStr);
        log("超时未出现: " + textStr);
        sleepMs(1000)
        toast("请检查是否已签到！")
        log("请检查是否已签到！")
        return false;
    }
    let node = text(textStr).findOnce();
    if (!node) node = textContains(textStr).findOnce();
    if (!node) {
        toast("找到文本但未取得节点对象: " + textStr);
        log("找到文本但未取得节点对象: " + textStr);
        return false;
    }
    let clicked = safeClick(node);
    if (!clicked) {
        toast("点击失败: " + textStr);
        log("点击失败: " + textStr);
        return false;
    }
    sleepMs(1200);
    return true;
}

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

function clickUnderText(textStr, yOffset = 60, timeout = DEFAULT_TIMEOUT){
    toast("等待并点击 " + textStr + " 下方按钮");
    if (!waitForText(textStr, timeout)) return false;
    let node = text(textStr).findOnce() || textContains(textStr).findOnce();
    if (!node) return false;
    try {
        let b = node.bounds();
        click(b.centerX(), b.bottom + yOffset);
        sleepMs(AFTER_CLICK_SLEEP + 300);
        return true;
    } catch(e){
        return false;
    }
}

function submitAndConfirm(){
    if (!waitForTextAndClick("提交签到", DEFAULT_TIMEOUT)) {
        return false
    }
    if (waitForText("确认", 8000)) {
        waitForTextAndClick("确认", 8000);
    }
    return true;
}

function main(){
    toast("开始自动签到");
    log("开始自动签到");
    launchApp("数字FAFU");
    sleepMs(6000);
    if (!waitForTextAndClick("学生管理", 30000)) {
        toast("步骤失败：学生管理");
        return;
    }
    if (!clickFirstSign(30000)) {
        toast("步骤失败：点击签到");
        return;
    }
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
