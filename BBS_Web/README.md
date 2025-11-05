# BBS 게시판 웹사이트

Supabase와 연동되는 게시판 기반 웹사이트입니다. HTML5, CSS3, JavaScript로 구현되었습니다.

## 주요 기능

- ✅ 게시글 목록 보기
- ✅ 게시글 작성
- ✅ 게시글 수정
- ✅ 게시글 삭제
- ✅ 게시글 상세 보기
- ✅ 페이지네이션
- ✅ 반응형 디자인

## 설치 및 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성합니다.
2. 프로젝트 설정에서 **API URL**과 **anon/public key**를 확인합니다.

### 2. 데이터베이스 테이블 생성

Supabase 대시보드의 SQL Editor에서 다음 SQL을 실행합니다:

```sql
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 설정
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 설정
CREATE POLICY "Anyone can read posts" ON posts FOR SELECT USING (true);

-- 모든 사용자가 작성 가능하도록 설정
CREATE POLICY "Anyone can insert posts" ON posts FOR INSERT WITH CHECK (true);

-- 모든 사용자가 수정 가능하도록 설정
CREATE POLICY "Anyone can update posts" ON posts FOR UPDATE USING (true);

-- 모든 사용자가 삭제 가능하도록 설정
CREATE POLICY "Anyone can delete posts" ON posts FOR DELETE USING (true);
```

### 3. Supabase 설정 파일 수정

`script.js` 파일을 열고 다음 부분을 수정합니다:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

위 값을 자신의 Supabase 프로젝트 URL과 API 키로 변경합니다.

### 4. 로컬 서버 실행

웹 브라우저에서 직접 `index.html` 파일을 열거나, 로컬 서버를 실행합니다:

#### Python을 사용하는 경우:
```bash
python -m http.server 8000
```

#### Node.js를 사용하는 경우:
```bash
npx http-server -p 8000
```

그 다음 브라우저에서 `http://localhost:8000`으로 접속합니다.

## 파일 구조

```
BBS_Web/
├── index.html      # 메인 HTML 파일
├── style.css       # 스타일시트
├── script.js       # JavaScript 로직 및 Supabase 연동
└── README.md       # 이 파일
```

## 사용 방법

1. **게시글 작성**: 상단의 "글쓰기" 버튼을 클릭하여 새 글을 작성합니다.
2. **게시글 보기**: 게시글 목록에서 원하는 글을 클릭하면 상세 내용을 볼 수 있습니다.
3. **게시글 수정**: 게시글 상세 보기에서 "수정" 버튼을 클릭합니다.
4. **게시글 삭제**: 게시글 상세 보기에서 "삭제" 버튼을 클릭합니다.

## 기술 스택

- **HTML5**: 구조적 마크업
- **CSS3**: 모던한 스타일링 및 반응형 디자인
- **JavaScript (ES6+)**: 클라이언트 사이드 로직
- **Supabase**: 백엔드 데이터베이스 및 API

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 라이선스

이 프로젝트는 자유롭게 사용할 수 있습니다.

