# UNO SPACE STATION — 8-bit Full Game Prototype V3

이번 버전은 UNO팡 단독이 아니라 **전체 게임 월드**를 구현한 산학협력 발표용 프로토타입입니다.

## 포함 화면
1. UNO SPACE STATION 월드맵
2. UNO팡 — 7×7 실제 Match-3
3. UNO Chef — 피자 토핑 선택 / 완성
4. 우주인 꾸미기 — 게임 진행에 따른 아이템 해금
5. 보상 스테이션 — 게임 포인트 → 쿠폰 교환
6. Campus League Planet — 학교 선택 / 10초 탭 경쟁 / 랭킹 반영
7. UNO Space Shop — 실제 구매 전환 CTA

## UNO팡 구현
- 인접 타일 swap
- 가로/세로 3개 이상 판정
- 제거 → 낙하 → 새 타일 생성 → 연쇄 match
- 60초 게임
- Score / Combo
- UNO Meal Gauge
- Gauge 100% → 10초 UNO FEVER
- FEVER 동안 점수 ×2
- 결과 보상

## 폰트
- 전체 UI: `Galmuri11` 중심
- 작은 라벨 폴백: `Galmuri9`
- 한글과 영문을 모두 같은 픽셀 계열로 통일
- 폰트 파일을 프로젝트에 포함하지 않고 jsDelivr CDN에서 웹폰트 CSS를 불러옵니다.

따라서 메뉴, 버튼, 설명, 게임 가이드 문구까지 전부 한글 픽셀 게임 톤으로 보입니다.

## GitHub Pages
1. 새 Repository 생성
2. 이 폴더 안의 `index.html`, `style.css`, `script.js`, `assets/` 업로드
3. Settings → Pages
4. Deploy from a branch
5. `main` / `/root`
6. Save


## V5
390px 기준 모바일 게임 UI, 하단 네비게이션, 세로형 월드맵 및 전 화면 모바일 최적화.
