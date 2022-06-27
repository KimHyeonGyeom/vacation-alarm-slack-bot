# 슬랙 연차 알림 봇 
<img width="1104" alt="image" src="https://user-images.githubusercontent.com/76893270/175920997-caad69dc-e128-4622-961c-bdfe7aed435d.png">

---

<br/><br/>

## 📜 목차
* [소개](#-소개)
* [구성](#-구성)
* [기술 스택](#-기술-스택)
* [고민거리](#-고민거리)
* [TODO](#-TODO)
* [기능 이미지로 보기](#-기능-이미지로-보기)

<br/><br/>

## 🗣 소개

#### 🏘 연차 알림 봇

 매일 오전 10시에 휴가를 사용한 인원이 있으면 슬랙으로 메시지를 보내주는 봇입니다.


<br/><br/>

## 👉🏻 구성
![Untitled1](https://user-images.githubusercontent.com/76893270/175921677-ba7f8233-14ef-4055-8ae8-521a1b3ea4c6.png)


<br/><br/>

## 🛠 기술 스택
![Untitled](https://user-images.githubusercontent.com/76893270/175921738-6982b26d-93a6-4fcb-a065-64c406a1a75b.png)

<br/><br/>

## 🤦 고민거리 
 # 1.몇 년도에 사용한 휴가인가?

  <원티드 스페이스 휴가 사용 시 알림>
  
  <img width="416" alt="Untitled (1)" src="https://user-images.githubusercontent.com/76893270/175922008-06b1d659-8c1e-4aec-a285-9025bd0a7cc6.png">


 현재 회사에서는 원티드스페이스를 사용하여 연차 관리를 하고 있는데, 연차 사용 시 몇 년도의 연차를 사용한 건지 알 수 없음.
 
 ### 방법 1
  - 금일 날짜 기준으로 과거 날짜로 올라오면 내년 연차로 계산
  
  **문제점 : 만약 연차를 미리 올리지 못하고 추후에 올리는 경우에 문제가 발생.**
 
  >  금일 기준으로 2달 전은 미리 올리지 못한 휴가라 판단하고 계산(10개월 뒤 휴가를 올리지 않을거란 판단)
      
  <br/><br/>    
 # 2.AWS Lambda vs ECS 선택 
 연차 알림 봇은 오전 10시에 한 번만 실행되면 되기 때문에 AWS **Lambda**와 **ECS** 에서 배포를 고민하다 조금(?) 이나마 친숙한  **Lambda**를 선택하였습니다. 
 
  **문제점 : **Lambda**에 배포를 하고 테스트 하는 중에 위 사진처럼 **slack API** 연결에서 자꾸 문제가 발생하였습니다.**

 ### 임시 해결
  - 문제 해결까지 시간이 많이 소요되어 급하게 기존에 회사에서 사용하고 있던 **ECS**에 배포하게 되었습니다.


<br/><br/>

## ✅ TODO

- [X] 휴가 알림 채널에서 대화 기록 추출
- [x] 대화 기록에서 휴가 사용/취소 데이터 가공해서 redis에 저장
- [x] 휴가 공지 채널에 금일 휴가자 알림 
- [x] 오늘 날짜 → Epoch & Unix Timestamp 형태로 변경 
- [x] aws(ECS) 배포
- [x] 현재 날짜 기준으로 2달 전에 올라온 휴가는 이번 년도 휴가로 판단하는 로직 추가
- [x] 연차 알림 슬랙으로 보내고 난 후 당일 데이터 redis에서 삭제 
- [x] ECS 예약 일정(오전 10시) 추가

<br/><br/>

## 🧩 기능 이미지로 보기

<img width="1104" alt="image" src="https://user-images.githubusercontent.com/76893270/175920997-caad69dc-e128-4622-961c-bdfe7aed435d.png">






---