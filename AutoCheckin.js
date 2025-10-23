// Auto.js 自动签到脚本：数字FAFU
// 需要开启无障碍服务和悬浮窗权限

function waitForText(textStr, timeout = 15000){
    let elapsed = 0;
    while(!textContains(textStr).exists() && elapsed < timeout){
        sleep(3000);
        elapsed += 1000;
    }
    return textContains(textStr).exists();
}

// 点击签到按钮，通过控件坐标点击
function clickSignButton(){
    toast("等待签到按钮...");
    let elapsed = 0;
    while(elapsed < 15000){
        let signBtn = text("签到").findOnce();
        if(signBtn){
            let rect = signBtn.bounds();
            click(rect.centerX(), rect.centerY());
            sleep(3000);
            toast("签到按钮点击成功");
            return true;
        }
        sleep(3000);
        elapsed += 1000;
    }
    toast("签到按钮未找到");
    return false;
}

// 点击“已请假”下方按钮（坐标点击）
function clickLeaveButton(){
    if(waitForText("已请假", 10000)){
        let leaveText = text("已请假").findOnce();
        if(leaveText){
            let rect = leaveText.bounds();
            // 点击文字下方50px处，通常是按钮
            click(rect.centerX(), rect.bottom + 50);
            sleep(3000);
            toast("点击已请假下方按钮成功");
            return true;
        } else {
            toast("未找到已请假文字");
            return false;
        }
    } else {
        toast("未找到已请假文字");
        return false;
    }
}

function main(){
    toast("开始自动签到");

    // 1. 打开数字FAFU
    launchApp("数字FAFU");
    sleep(5000);

    // 2. 点击“学生管理”
    if(waitForText("学生管理", 10000)){
        textContains("学生管理").click();
        sleep(3000);
    } else {
        toast("未找到学生管理按钮");
        return;
    }

    // 3. 点击“签到”
    if(!clickSignButton()){
        return;
    }

    // 4. 点击“已请假”下方按钮
    if(!clickLeaveButton()){
        return;
    }

    // 5. 点击“提交签到”
    if(waitForText("提交签到", 10000)){
        textContains("提交签到").click();
        sleep(3000);
    } else {
        toast("未找到提交签到按钮");
        return;
    }

    // 6. 点击“确认”
    if(waitForText("确认", 10000)){
        textContains("确认").click();
        toast("签到完成");
    } else {
        toast("未找到确认按钮");
    }
}

// 执行主流程
main();
