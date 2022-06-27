import moment from "moment";
import 'moment/locale/ko.js';
const todayDate = moment().format('YYYY-MM-DD');
export const SLACK_MESSAGE_TEMPLATE = [
    {
        "type": "header",
        "text": {
            "type": "plain_text",
            "text": `[휴가일정]  ${moment(todayDate).format('YYYY. MM. DD')} ` + '(' + moment(todayDate).format('dddd').slice(0, 1) + ')'
        }
    },
]

//"text": `{ *{vacationers}님 ({vacationType})* {workingHours}`
export const SLACK_VACATION_MESSAGE_TEMPLATE = {
    "type": "section",
    "text":
    {
        "type": "mrkdwn",
        "text": `● *{0}님 ({1})* {2}`
    }
}

