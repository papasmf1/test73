// Supabase 설정
// 여기에 자신의 Supabase 프로젝트 URL과 API 키를 입력하세요
const SUPABASE_URL = 'https://cjuzhzcrghbajctljgqf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqdXpoemNyZ2hiYWpjdGxqZ3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNDgyMjgsImV4cCI6MjA3NzgyNDIyOH0.ufOk7W5esaFQzQCJf49Pc9nrRrgzBUq_UjMI6BkHm6Q';

let supabase;
let currentPage = 1;
const postsPerPage = 10;
let currentPostId = null;

// Supabase 초기화
function initSupabase() {
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        alert('Supabase 설정을 먼저 해주세요!\nscript.js 파일에서 SUPABASE_URL과 SUPABASE_KEY를 입력하세요.');
        return false;
    }
    
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return true;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    if (!initSupabase()) {
        return;
    }
    
    // 테이블이 없으면 생성 안내
    await checkTableExists();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 게시글 목록 로드
    await loadPosts();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 글쓰기 버튼
    document.getElementById('writeBtn').addEventListener('click', () => {
        openWriteModal();
    });

    // 모달 닫기
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // 취소 버튼
    document.getElementById('cancelBtn').addEventListener('click', () => {
        closeAllModals();
    });

    // 글 작성 폼 제출
    document.getElementById('postForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePost();
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        const writeModal = document.getElementById('writeModal');
        const viewModal = document.getElementById('viewModal');
        if (e.target === writeModal) {
            closeAllModals();
        }
        if (e.target === viewModal) {
            closeAllModals();
        }
    });

    // 수정 버튼
    document.getElementById('editBtn').addEventListener('click', () => {
        editPost();
    });

    // 삭제 버튼
    document.getElementById('deleteBtn').addEventListener('click', () => {
        if (confirm('정말 삭제하시겠습니까?')) {
            deletePost();
        }
    });
}

// 게시글 목록 로드
async function loadPosts() {
    const boardList = document.getElementById('boardList');
    boardList.innerHTML = '<div class="loading">로딩 중...</div>';

    try {
        const { data, error, count } = await supabase
            .from('posts')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((currentPage - 1) * postsPerPage, currentPage * postsPerPage - 1);

        if (error) throw error;

        if (!data || data.length === 0) {
            boardList.innerHTML = `
                <div class="empty-state">
                    <h3>게시글이 없습니다</h3>
                    <p>첫 번째 글을 작성해보세요!</p>
                </div>
            `;
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        displayPosts(data);
        displayPagination(count);
    } catch (error) {
        console.error('게시글 로드 실패:', error);
        boardList.innerHTML = `<div class="empty-state"><h3>오류 발생</h3><p>${error.message}</p></div>`;
    }
}

// 게시글 표시
function displayPosts(posts) {
    const boardList = document.getElementById('boardList');
    
    boardList.innerHTML = posts.map(post => `
        <div class="board-item" onclick="viewPost(${post.id})">
            <div class="board-item-header">
                <div class="board-item-title">${escapeHtml(post.title)}</div>
                <div class="board-item-meta">
                    <span>작성자: ${escapeHtml(post.author)}</span>
                    <span>${formatDate(post.created_at)}</span>
                </div>
            </div>
            <div class="board-item-content">${escapeHtml(post.content)}</div>
        </div>
    `).join('');
}

// 페이지네이션 표시
function displayPagination(totalCount) {
    const totalPages = Math.ceil(totalCount / postsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    // 이전 페이지 버튼
    paginationHTML += `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            이전
        </button>
    `;

    // 페이지 번호 버튼
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `<span>...</span>`;
        }
    }

    // 다음 페이지 버튼
    paginationHTML += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            다음
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

// 페이지 변경
async function changePage(page) {
    currentPage = page;
    await loadPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 게시글 상세 보기
async function viewPost(id) {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        currentPostId = id;
        document.getElementById('detailTitle').textContent = data.title;
        document.getElementById('detailAuthor').textContent = `작성자: ${escapeHtml(data.author)}`;
        document.getElementById('detailDate').textContent = formatDate(data.created_at);
        document.getElementById('detailContent').textContent = data.content;

        document.getElementById('viewModal').style.display = 'block';
    } catch (error) {
        console.error('게시글 로드 실패:', error);
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
    }
}

// 글쓰기 모달 열기
function openWriteModal(id = null) {
    currentPostId = id;
    const modal = document.getElementById('writeModal');
    const form = document.getElementById('postForm');
    
    if (id) {
        document.getElementById('modalTitle').textContent = '글 수정';
        loadPostForEdit(id);
    } else {
        document.getElementById('modalTitle').textContent = '새 글 작성';
        form.reset();
        document.getElementById('postId').value = '';
    }
    
    modal.style.display = 'block';
}

// 수정을 위한 게시글 로드
async function loadPostForEdit(id) {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        document.getElementById('postId').value = data.id;
        document.getElementById('title').value = data.title;
        document.getElementById('author').value = data.author;
        document.getElementById('content').value = data.content;
    } catch (error) {
        console.error('게시글 로드 실패:', error);
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
    }
}

// 글 저장
async function savePost() {
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const content = document.getElementById('content').value.trim();
    const postId = document.getElementById('postId').value;

    if (!title || !author || !content) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    try {
        if (postId) {
            // 수정
            const { error } = await supabase
                .from('posts')
                .update({
                    title: title,
                    author: author,
                    content: content,
                    updated_at: new Date().toISOString()
                })
                .eq('id', postId);

            if (error) throw error;
            alert('글이 수정되었습니다.');
        } else {
            // 새 글 작성
            const { error } = await supabase
                .from('posts')
                .insert([
                    {
                        title: title,
                        author: author,
                        content: content
                    }
                ]);

            if (error) throw error;
            alert('글이 작성되었습니다.');
        }

        closeAllModals();
        await loadPosts();
    } catch (error) {
        console.error('글 저장 실패:', error);
        alert('글 저장 중 오류가 발생했습니다: ' + error.message);
    }
}

// 글 수정
function editPost() {
    closeAllModals();
    setTimeout(() => {
        openWriteModal(currentPostId);
    }, 300);
}

// 글 삭제
async function deletePost() {
    try {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', currentPostId);

        if (error) throw error;

        alert('글이 삭제되었습니다.');
        closeAllModals();
        await loadPosts();
    } catch (error) {
        console.error('글 삭제 실패:', error);
        alert('글 삭제 중 오류가 발생했습니다: ' + error.message);
    }
}

// 모달 닫기
function closeAllModals() {
    document.getElementById('writeModal').style.display = 'none';
    document.getElementById('viewModal').style.display = 'none';
    currentPostId = null;
}

// 날짜 포맷
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
        return date.toLocaleDateString('ko-KR');
    } else if (days > 0) {
        return `${days}일 전`;
    } else if (hours > 0) {
        return `${hours}시간 전`;
    } else if (minutes > 0) {
        return `${minutes}분 전`;
    } else {
        return '방금 전';
    }
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 테이블 존재 확인 및 생성 안내
async function checkTableExists() {
    try {
        const { error } = await supabase
            .from('posts')
            .select('id')
            .limit(1);

        if (error && error.code === 'PGRST116') {
            console.warn('posts 테이블이 존재하지 않습니다.');
            alert('Supabase에서 posts 테이블을 먼저 생성해주세요!\n\nSQL 쿼리:\n' + getCreateTableSQL());
        }
    } catch (error) {
        console.error('테이블 확인 실패:', error);
    }
}

// 테이블 생성 SQL 반환
function getCreateTableSQL() {
    return `
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 설정 (선택사항)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 설정
CREATE POLICY "Anyone can read posts" ON posts FOR SELECT USING (true);

-- 모든 사용자가 작성 가능하도록 설정
CREATE POLICY "Anyone can insert posts" ON posts FOR INSERT WITH CHECK (true);

-- 모든 사용자가 수정 가능하도록 설정
CREATE POLICY "Anyone can update posts" ON posts FOR UPDATE USING (true);

-- 모든 사용자가 삭제 가능하도록 설정
CREATE POLICY "Anyone can delete posts" ON posts FOR DELETE USING (true);
    `;
}

