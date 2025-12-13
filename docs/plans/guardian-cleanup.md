# Guardian App 정리 계획 (Cleanup Plan)

## 개요

현재 `dongdong-rn` 프로젝트는 간병인용(Caregiver)과 보호자용(Guardian) 기능이 혼재되어 있습니다.
Guardian 앱으로 전환하기 위해 불필요한 간병인용 코드를 정리합니다.

---

## 정리 대상

### 1. 삭제할 디렉토리/파일

| 경로 | 설명 | 조치 |
|------|------|------|
| `app/(auth)/caregiver/` | 간병인 가입 플로우 전체 | **삭제** |
| `src/features/caregiver/` | 간병인 관련 feature | **삭제** |

### 2. 간병인 폴더 상세

```
app/(auth)/caregiver/
├── _layout.tsx           # 간병인 가입 레이아웃
├── qualification.tsx     # 자격 정보 입력
├── register.tsx          # 간병인 등록
└── work-preference.tsx   # 근무 선호도
```

### 3. 수정이 필요한 파일

| 파일 | 수정 내용 |
|------|----------|
| `app/(auth)/role-selection.tsx` | 역할 선택 로직에서 간병인 제거 또는 조건부 처리 |
| `app/(auth)/_layout.tsx` | caregiver 라우트 제거 |
| 관련 스토어/타입 | 간병인 관련 타입/스토어 정리 |

### 4. 유지할 파일 (Guardian 전용)

```
app/(auth)/
├── _layout.tsx           # 유지 (수정)
├── guardian/             # 유지
│   ├── _layout.tsx
│   └── register.tsx
├── login.tsx             # 유지
├── signup.tsx            # 유지
├── phone-verify.tsx      # 유지
├── terms.tsx             # 유지
├── patient-info.tsx      # 유지 (보호자가 환자 정보 입력)
├── patient-condition.tsx # 유지
├── permission.tsx        # 유지
└── role-selection.tsx    # 유지 (수정: 환자/보호자 선택만)
```

---

## 작업 순서

### Phase 1: 분석 (현재 완료)
- [x] 삭제할 파일/폴더 식별
- [x] 수정이 필요한 파일 파악

### Phase 2: 백업 및 삭제
- [ ] Git 커밋으로 현재 상태 백업
- [ ] `app/(auth)/caregiver/` 폴더 삭제
- [ ] `src/features/caregiver/` 폴더 삭제

### Phase 3: 코드 수정
- [ ] `role-selection.tsx` 수정 (간병인 옵션 제거)
- [ ] 라우팅 레이아웃 정리
- [ ] 불필요한 import 제거

### Phase 4: 검증
- [ ] 빌드 테스트
- [ ] 회원가입 플로우 테스트
- [ ] 로그인 플로우 테스트

---

## 주의사항

> [!IMPORTANT]
> 삭제 전 반드시 Git 커밋을 수행하여 롤백 포인트를 만들어 두세요.

> [!NOTE]
> `features/caregiver/` 폴더 삭제 시 다른 파일에서 import 에러가 발생할 수 있습니다.
> TypeScript 빌드 오류를 확인하며 순차적으로 정리하세요.

---

## 예상 소요 시간

| 작업 | 시간 |
|------|------|
| 백업 및 삭제 | 10분 |
| 코드 수정 | 30분 |
| 검증 및 테스트 | 20분 |
| **합계** | **~1시간** |
