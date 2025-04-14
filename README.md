# 발전소 관리 시스템

발전소 관리 시스템은 태양광, 풍력 등 다양한 발전소의 실시간 모니터링 및 관리를 위한 웹 애플리케이션입니다.

## 기술 스택

- Next.js 15.3.0
- React 19
- TypeScript 5
- Tailwind CSS 4
- Shadcn UI
- React Hook Form 7
- Zod (폼 유효성 검증)
- Leaflet (지도 기능)
- Date-fns (날짜 처리)
- UUID (고유 식별자 생성)

## 설치 및 실행 방법

1. 저장소 클론:

```bash
git clone https://github.com/yourusername/plants-management.git
cd plants-management
```

2. 의존성 설치:

```bash
npm install
```

3. 개발 서버 실행:

```bash
npm run dev
```

4. 브라우저에서 `http://localhost:3000` 접속

## 주요 기능

### 1. 대시보드

- 발전소 현황 요약 (상태별, 유형별)
- 최근 변경 이력
- 주요 성능 지표

### 2. 발전소 관리

- **리스트 뷰**: 모든 발전소 목록 및 필터링
  - 유형별 필터링 (태양광, 풍력 등)
  - 지역별 필터링
  - 용량 범위 필터링
- **지도 뷰**: 지도 기반 발전소 위치 및 상태 확인
  - 발전소 유형별 마커 표시
  - 클러스터링 지원
  - 마커 클릭 시 상세 정보 표시

### 3. 발전소 상세/편집

- 발전소 상세 정보 조회
- 발전소 정보 수정
- 지도를 통한 위치 확인
- 변경 이력 관리

## API 구조

- `GET /api/plants` - 발전소 목록 조회
- `POST /api/plants` - 새 발전소 등록
- `GET /api/plants/[id]` - 개별 발전소 조회
- `PATCH /api/plants/[id]` - 발전소 정보 수정
- `DELETE /api/plants/[id]` - 발전소 삭제
- `GET /api/plants/history` - 변경 이력 조회

## 변경 이력 관리

시스템은 발전소 정보의 모든 변경 사항을 기록합니다:

1. **생성(create)**: 새 발전소가 등록될 때
2. **수정(update)**: 발전소 정보가 변경될 때
3. **삭제(delete)**: 발전소가 삭제될 때

변경 이력은 JSON 파일 형태로 `data/history` 디렉토리에 저장되며, 각 변경사항은 고유한 UUID를 가집니다.

## 개발 환경

- Node.js 20 이상
- npm 10 이상

## 향후 계획

- 실시간 모니터링 대시보드 추가
- 사용자 인증 및 권한 관리
- 알림 시스템
- 데이터베이스 연동 (현재는 파일 기반 저장소 사용)
