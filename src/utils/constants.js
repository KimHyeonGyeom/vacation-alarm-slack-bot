import moment from "moment";

const todayDate = moment().format('YYYY-MM-DD');
export const SLACK_MESSAGE_TEMPLATE = [
    {
        "type": "header",
        "text": {
            "type": "plain_text",
            "text": "행복을 찾아 떠나는 사람들 :beach_with_umbrella:"
        }
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `*오늘의 휴가* ${moment(todayDate).format('YYYY. MM. DD')} ` + '(' + moment(todayDate).format('dddd').slice(0, 1) + ')'
        }
    },
    {
        "type": "divider"
    },
    {
        "type": "image",
        "image_url": "https://ifh.cc/g/QFFNsK.png",
        "alt_text": "inspiration"
    }
]

//"text": `{emoji}*{vacationers}님 ({vacationType})* {workingHours}`
export const SLACK_VACATION_MESSAGE_TEMPLATE = {
    "type": "section",
    "text":
        {
            "type": "mrkdwn",
            "text": `{0}*{1}님 ({2})* {3}`
        }
}

