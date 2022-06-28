import moment from "moment";
import {createClient} from 'redis';
import * as dotenv from "dotenv";
import {SLACK_VACATION_MESSAGE_TEMPLATE} from "./constants.js";

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST;

export const redisClient = createClient({
    url: `redis://${REDIS_HOST}`,
});

redisClient.connect();
redisClient.on('connect', function () {
    console.log('####################################### Redis client connected #######################################');
});

export const unixTimestampConvert = () => {
    const now = new Date();
    return Math.floor(new Date(now.setDate(now.getDate() - 1)).getTime() / 1000);
}

const sanitizeDateString = (targetString ) => {
    const now = new Date()
    const nowMonth = now.getMonth() + 1
    const hasDate = targetString.includes('일')
    const hasDateAndMonth = hasDate && targetString.includes('월')
    let year = now.getFullYear()

    if (targetString.split('월')[0] < nowMonth && (nowMonth - 2) >= targetString.split('월')[0]) {
        year = now.getFullYear() + 1;
    }

    let sanitized = targetString.replace(/\s/g, '')

    if (hasDateAndMonth) {
        const momentFormat = 'YYYY-MM-DD'
        return moment(`${year}년${sanitized}`, momentFormat).format('YYYY-MM-DD')
    }

    throw new Error('올바르지 않은 문자열')
}

const getDatesStartToLast = (startDate, lastDate) => {
    const regex = RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);
    if (!(regex.test(startDate) && regex.test(lastDate))) return "Not Date Format";
    const result  = [];
    const curDate = new Date(startDate);
    while (curDate <= new Date(lastDate)) {
        result.push(curDate.toISOString().split("T")[0]);
        curDate.setDate(curDate.getDate() + 1);
    }
    return result;
}

export const getVacationDateList = (vacationDate) => {
    const vacationDateList = [];
    if (vacationDate.includes('-')) {
        vacationDate.split('-').reduce((firstDate, lastDate) => {
            if (lastDate.length < 8) {
                lastDate = firstDate.split('월')[0] + '월' + lastDate
            }
            getDatesStartToLast(sanitizeDateString(firstDate), sanitizeDateString(lastDate)).forEach((date) => {
                vacationDateList.push(date);
            })
            return vacationDateList;
        })

    } else {
        vacationDateList.push(sanitizeDateString(vacationDate));
    }
    return vacationDateList;
}


export const pushSlackMessage = (todayAnnualSlackMessage , vacationers , vacationType , emoji , workingHours = '') => {
    if (vacationers.length === 0) return;

    if (vacationers.length > 1) {
        for (const vacationer of vacationers) {
            todayAnnualSlackMessage.push(JSON.parse(stringFormat(JSON.stringify(SLACK_VACATION_MESSAGE_TEMPLATE), emoji, vacationer, vacationType, workingHours))) ;
        }
    } else {
        todayAnnualSlackMessage.push(JSON.parse(stringFormat(JSON.stringify(SLACK_VACATION_MESSAGE_TEMPLATE), emoji, vacationers, vacationType, workingHours)));
    }
}

export const setRedisVacationData = async (vacationList ) => {
    for (const vacationData of vacationList.reverse()) {
        switch (true) {
            case vacationData.vacation_type.includes('연차 신청') :
                await redisClient.sendCommand(['SADD', `${vacationData.date} 연차`, vacationData.name]);
                break;
            case vacationData.vacation_type.includes('반차(오전) 신청') :
                await redisClient.sendCommand(['SADD', `${vacationData.date} 오전 반차`, vacationData.name]);
                break;
            case vacationData.vacation_type.includes('반차(오후) 신청') :
                await redisClient.sendCommand(['SADD', `${vacationData.date} 오후 반차`, vacationData.name]);
                break;
            case vacationData.vacation_type.includes('병가 신청') :
                await redisClient.sendCommand(['SADD', `${vacationData.date} 병가`, vacationData.name]);
                break;
            case vacationData.vacation_type.includes('병가(오전) 신청') :
                await redisClient.sendCommand(['SADD', `${vacationData.date} 오전 병가`, vacationData.name]);
                break;
            case vacationData.vacation_type.includes('병가(오후) 신청') :
                await redisClient.sendCommand(['SADD', `${vacationData.date} 오후 병가`, vacationData.name]);
                break;
            case vacationData.vacation_type.includes('연차 (취소)') :
                await redisClient.sendCommand(['SREM', `${vacationData.date} 연차`, vacationData.name]);
                break;
            case vacationData.vacation_type.includes('반차(오전) (취소)') :
                await redisClient.sendCommand(['SREM', `${vacationData.date} 오전 반차`, vacationData.name]);
                break;
            case vacationData.vacation_type.includes('반차(오후) (취소)') :
                await redisClient.sendCommand(['SREM', `${vacationData.date} 오후 반차`, vacationData.name]);
                break;
            case vacationData.vacation_type.includes('병가 (취소)') :
                await redisClient.sendCommand(['SREM', `${vacationData.date} 병가`, vacationData.name]);
                break;
            case vacationData.vacation_type.includes('병가(오전)(취소)') :
                await redisClient.sendCommand(['SREM', `${vacationData.date} 오전 병가`, vacationData.name]);
                break;
            case vacationData.vacation_type.includes('병가(오후)(취소)') :
                await redisClient.sendCommand(['SREM', `${vacationData.date} 오후 병가`, vacationData.name]);
                break;
        }
        //console.log(vacationData);
    }
}

export const deleteRedisTodayVacationData = async ( today ) =>{
    await redisClient.sendCommand(['DEL', `${today} 연차`,`${today} 오전 반차`,`${today} 오후 반차`,`${today} 병가`,`${today} 오전 병가`,`${today} 오후 병가`]);
    //console.log(await redisClient.sendCommand(['KEYS', '*']));
    await redisClient.disconnect();
}
function stringFormat() {
    const args = Array.prototype.slice.call (arguments, 1);
    return arguments[0].replace (/\{(\d+)\}/g, function (match  , index ) {
        return args[index];
    });
}
