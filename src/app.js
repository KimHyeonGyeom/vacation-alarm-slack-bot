import * as dotenv from 'dotenv';
import pkg from '@slack/bolt';
import {
    deleteRedisTodayVacationData,
    getVacationDateList,
    pushSlackMessage,
    redisClient,
    setRedisVacationData,
    unixTimestampConvert
} from "./utils/utils.js";
import moment from "moment";
import 'moment/locale/ko.js';
import {SLACK_MESSAGE_TEMPLATE} from "./utils/constants.js";

dotenv.config();
const {App} = pkg;

const todayDate = moment().format('YYYY-MM-DD');
// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true, // add this
    appToken: process.env.APP_TOKEN // add this
});


async function sendSlackMessage(vacationNoticeChannelId ) {
    try {

        //const todayDate = moment().format('YYYY-MM-DD');
        let todayAnnualList  = await redisClient.sendCommand(['SMEMBERS', `${todayDate} 연차`]);
        let todayAmHalfwayList = await redisClient.sendCommand(['SMEMBERS', `${todayDate} 오전 반차`]);
        let todayPmHalfwayList = await redisClient.sendCommand(['SMEMBERS', `${todayDate} 오후 반차`]);

        let todaySickLeaveList = await redisClient.sendCommand(['SMEMBERS', `${todayDate} 병가`]);
        let todayAmSickLeaveList = await redisClient.sendCommand(['SMEMBERS', `${todayDate} 오전 병가`]);
        let todayPmSickLeaveList = await redisClient.sendCommand(['SMEMBERS', `${todayDate} 오후 병가`]);

        if (todayAnnualList.length === 0 && todayAmHalfwayList.length === 0 && todayPmHalfwayList.length === 0 &&
            todaySickLeaveList.length === 0 && todayAmSickLeaveList.length === 0 && todayPmSickLeaveList.length === 0) {
            console.log('금일 휴가/병가를 사용한 인원이 없습니다.')
            return;
        }

        // console.log('연차 날짜 ' + todayDate)
        // console.log('연차 : ' + todayAnnualList)
        // console.log('오전 반차 : ' + todayAmHalfwayList)
        // console.log('오후 반차 : ' + todayPmHalfwayList)
        // console.log('병가 : ' + todaySickLeaveList)
        // console.log('오전 병가 : ' + todayAmSickLeaveList)
        // console.log('오후 병가 : ' + todayPmSickLeaveList)
        const todayAnnualSlackMessage = SLACK_MESSAGE_TEMPLATE;


        pushSlackMessage(todayAnnualSlackMessage, todayAnnualList, '연차', ':desert_island:');
        pushSlackMessage(todayAnnualSlackMessage, todayAmHalfwayList, '오전 반차', ':sunny:', '`오전 10:00 ~ 오후 01:30`');
        pushSlackMessage(todayAnnualSlackMessage, todayPmHalfwayList, '오후 반차', ':full_moon:', '`오후 13:30 ~ 오후 06:00`');
        pushSlackMessage(todayAnnualSlackMessage, todaySickLeaveList, '병가', ':hospital:',);
        pushSlackMessage(todayAnnualSlackMessage, todayAmSickLeaveList, '오전 병가', ':hospital:', '`오전 10:00 ~ 오후 01:30`');
        pushSlackMessage(todayAnnualSlackMessage, todayPmSickLeaveList, '오후 병가', ':hospital:', '`오후 13:30 ~ 오후 06:00`');



        //console.log(todayAnnualSlackMessage);
        // Call the chat.postMessage method using the built-in WebClient
        const result = await app.client.chat.postMessage({
            // The token you used to initialize your app
            token: process.env.SLACK_BOT_TOKEN,
            channel: vacationNoticeChannelId,
            text: `행복을 찾아 떠나는 사람들 :beach_with_umbrella:`,
            blocks: todayAnnualSlackMessage
        })
    } catch (error) {
        console.error(error);
    }
}

async function inputRedisVacationList(vacationChannelId) {
    let vacationList  = [];
    let conversationHistory ;
    try {
        const result = await app.client.conversations.history({
            token: process.env.SLACK_BOT_TOKEN,
            channel: vacationChannelId,
            oldest: unixTimestampConvert(),
            inclusive: false,
        });
        conversationHistory = result.messages;

        for (const conversation of conversationHistory) {
            if (conversation.text.includes('연차') || conversation.text.includes('반차') || conversation.text.includes('병가')) {
                const vacationDate = conversation.blocks[1].text.text.split('\n')[1].split(':')[1];
                const vacationDateList = getVacationDateList(vacationDate);
                vacationDateList.forEach((vacationDate ) => {
                    vacationList.push({
                        vacation_type: conversation.text,
                        name: conversation.blocks[1].text.text.split('\n')[0].split(':')[1],
                        date: vacationDate
                    })
                })
            }
        }
        //console.log(vacationList);
        await setRedisVacationData(vacationList);
    } catch (error) {
        console.error(error);
    }
}

(async () => {
    await inputRedisVacationList(process.env.VACATION_GET_CHANNEL_ID)
    await sendSlackMessage(process.env.VACATION_NOTICE_CHANNEL_ID);
    await deleteRedisTodayVacationData(todayDate);
})();