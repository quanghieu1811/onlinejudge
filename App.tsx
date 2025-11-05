import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ProblemList from './components/ProblemList';
import ProblemView from './components/ProblemView';
import CodeEditor from './components/CodeEditor';
import ResultDisplay from './components/ResultDisplay';
import SubmissionsView from './components/SubmissionsView';
import UserManagementView from './components/UserManagementView';
import TestCaseManager from './components/TestCaseManager';
import CreateProblemModal from './components/CreateProblemModal';
import GenerateProblemAIModal from './components/GenerateProblemAIModal'; // Import new component
import ChangePasswordModal from './components/ChangePasswordModal';
import { User, Problem, Submission, SubmissionResult, Verdict, Difficulty, TestCase, UserRole } from './types';
import { judgeCode } from './services/geminiService';
import { SUPPORTED_LANGUAGES, DEFAULT_CODE } from './constants';

// Dummy data
const initialUsers: User[] = [
    { username: 'admin', password: 'password', role: 'admin' },
    { username: 'teacher', password: 'password', role: 'teacher' },
    { username: 'student', password: 'password', role: 'student' },
];

const initialProblems: Problem[] = [
    {
        id: 'p1',
        title: 'Tính tổng hai số',
        description: `
Cho một mảng các số nguyên \`nums\` và một số nguyên \`target\`, trả về chỉ số của hai số trong mảng sao cho tổng của chúng bằng \`target\`.

Bạn có thể giả định rằng mỗi đầu vào sẽ có **chính xác một giải pháp**, và bạn không được sử dụng cùng một phần tử hai lần.

Bạn có thể trả về câu trả lời theo bất kỳ thứ tự nào.

**Ví dụ 1:**
- Đầu vào: \`nums = [2,7,11,15]\`, \`target = 9\`
- Đầu ra: \`[0,1]\`
- Giải thích: Vì nums[0] + nums[1] == 9, chúng ta trả về [0, 1].

**Ví dụ 2:**
- Đầu vào: \`nums = [3,2,4]\`, \`target = 6\`
- Đầu ra: \`[1,2]\`
        `,
        difficulty: 'Easy',
        testCases: [
            { id: 'tc1-1', input: '2 7 11 15\n9', output: '0 1', isPublic: true },
            { id: 'tc1-2', input: '3 2 4\n6', output: '1 2', isPublic: false },
        ]
    },
    {
        id: 'p2',
        title: 'Cộng hai số dạng danh sách liên kết',
        description: 'Bạn được cho hai danh sách liên kết không rỗng đại diện cho hai số nguyên không âm. Các chữ số được lưu trữ theo thứ tự ngược lại, và mỗi nút của chúng chứa một chữ số duy nhất. Hãy cộng hai số và trả về tổng dưới dạng một danh sách liên kết.',
        difficulty: 'Medium',
        testCases: [{ id: 'tc2-1', input: '[2,4,3]\n[5,6,4]', output: '[7,0,8]', isPublic: true }]
    },
];

type View = 'IDE' | 'Submissions' | 'UserManagement';

const App: React.FC = () => {
    // State management
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoadingProblems, setIsLoadingProblems] = useState<boolean>(true);
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<View>('IDE');
    const [activeFilter, setActiveFilter] = useState<Difficulty | 'All'>('All');

    // IDE State
    const [language, setLanguage] = useState<string>(SUPPORTED_LANGUAGES[0]);
    const [code, setCode] = useState<string>(DEFAULT_CODE[language]);
    const [isJudging, setIsJudging] = useState<boolean>(false);
    const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
    
    // Modal State
    const [problemToManage, setProblemToManage] = useState<Problem | null>(null);
    const [isCreateProblemModalOpen, setIsCreateProblemModalOpen] = useState(false);
    const [isGenerateProblemModalOpen, setIsGenerateProblemModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    
    useEffect(() => {
        // Simulate fetching initial problems from a server
        const timer = setTimeout(() => {
            setProblems(initialProblems);
            setSelectedProblemId('p1'); // Select first problem by default
            setIsLoadingProblems(false);
        }, 1500); // 1.5 second delay

        return () => clearTimeout(timer); // Cleanup on unmount
    }, []);

    const selectedProblem = problems.find(p => p.id === selectedProblemId) || null;
    const filteredProblems = problems.filter(p => activeFilter === 'All' || p.difficulty === activeFilter);

    // Handlers
    const handleLogin = (user: User) => setCurrentUser(user);
    const handleLogout = () => setCurrentUser(null);
    
    const handleSubmitCode = async () => {
        if (!selectedProblem || !currentUser) return;
        
        setIsJudging(true);
        setSubmissionResult({ verdict: Verdict.Pending, explanation: 'Bài nộp của bạn đang được chấm...', details: '' });

        const result = await judgeCode(selectedProblem, code, language);
        
        const newSubmission: Submission = {
            id: `sub-${Date.now()}`,
            userId: currentUser.username,
            problemId: selectedProblem.id,
            problemTitle: selectedProblem.title,
            code,
            language,
            timestamp: Date.now(),
            result,
        };
        
        setSubmissions(prev => [newSubmission, ...prev]);
        setSubmissionResult(result);
        setIsJudging(false);
    };
    
    const handleUpdateUserRole = (username: string, role: UserRole) => {
        setUsers(users.map(u => u.username === username ? { ...u, role } : u));
    };
    
    const handleDeleteUser = (username: string) => {
        if (window.confirm(`Bạn có chắc muốn xóa người dùng "${username}" không?`)) {
            setUsers(users.filter(u => u.username !== username));
        }
    };
    
    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        if (!currentUser) throw new Error("Không tìm thấy người dùng hiện tại.");
        
        const userInDb = users.find(u => u.username === currentUser.username);
        if (userInDb?.password !== currentPassword) {
            throw new Error("Mật khẩu hiện tại không chính xác.");
        }
        
        const updatedUsers = users.map(u => 
            u.username === currentUser.username ? { ...u, password: newPassword } : u
        );
        setUsers(updatedUsers);
    };

    const handleUpdateTestCases = (problemId: string, updatedTestCases: TestCase[]) => {
        setProblems(prevProblems => prevProblems.map(p => 
            p.id === problemId ? { ...p, testCases: updatedTestCases } : p
        ));
    };

    const handleCreateProblem = (newProblemData: Omit<Problem, 'id'>) => {
        const newProblem: Problem = {
            id: `p${Date.now()}`, // Simple unique ID
            ...newProblemData
        };
        setProblems(prev => [newProblem, ...prev]);
        setIsCreateProblemModalOpen(false);
        setIsGenerateProblemModalOpen(false);
    };

    const handleDeleteProblem = (problemId: string) => {
        if (window.confirm("Bạn có chắc muốn xóa bài toán này? Hành động này không thể hoàn tác.")) {
            setProblems(prev => prev.filter(p => p.id !== problemId));
            if (selectedProblemId === problemId) {
                setSelectedProblemId(null);
            }
        }
    };

    if (!currentUser) {
        return <Auth users={users} onLogin={handleLogin} onRegister={(newUser) => setUsers(prev => [...prev, newUser])} />;
    }

    return (
        <div className="bg-primary text-text-primary min-h-screen font-sans">
            {/* Header */}
            <header className="bg-secondary shadow-md sticky top-0 z-10">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <span className="font-bold text-xl text-highlight">CodeJudge</span>
                            <div className="hidden md:block ml-10">
                                <div className="flex items-baseline space-x-2">
                                    <button onClick={() => setActiveView('IDE')} className={`${activeView === 'IDE' ? 'text-highlight' : 'text-text-secondary'} hover:text-white px-3 py-2 rounded-md text-sm font-medium`}>Lập trình</button>
                                    <button onClick={() => setActiveView('Submissions')} className={`${activeView === 'Submissions' ? 'text-highlight' : 'text-text-secondary'} hover:text-white px-3 py-2 rounded-md text-sm font-medium`}>Lịch sử nộp bài</button>
                                    {currentUser.role === 'admin' && (
                                        <>
                                            <button onClick={() => setActiveView('UserManagement')} className={`${activeView === 'UserManagement' ? 'text-highlight' : 'text-text-secondary'} hover:text-white px-3 py-2 rounded-md text-sm font-medium`}>Người dùng</button>
                                            <button onClick={() => setIsCreateProblemModalOpen(true)} className="bg-accent text-text-primary font-semibold px-3 py-2 rounded-md hover:bg-highlight hover:text-white transition-colors text-sm">Bài mới</button>
                                            <button onClick={() => setIsGenerateProblemModalOpen(true)} className="bg-blue-600 text-white font-semibold px-3 py-2 rounded-md hover:bg-blue-500 transition-colors text-sm">Tạo bằng AI</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center">
                             <span className="text-text-secondary mr-4">Xin chào, {currentUser.username}!</span>
                             <button onClick={() => setIsChangePasswordModalOpen(true)} className="mr-2 bg-accent text-text-primary font-semibold px-3 py-2 rounded-md hover:bg-highlight hover:text-white transition-colors text-sm">Đổi mật khẩu</button>
                             <button onClick={handleLogout} className="bg-highlight text-white font-semibold px-3 py-2 rounded-md hover:bg-red-500 transition-colors text-sm">Đăng xuất</button>
                        </div>
                    </div>
                </nav>
            </header>
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {activeView === 'IDE' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-10rem)]">
                        <div className="lg:col-span-3 h-full">
                            <ProblemList 
                                problems={filteredProblems}
                                selectedProblemId={selectedProblemId}
                                onSelectProblem={setSelectedProblemId}
                                onDeleteProblem={handleDeleteProblem}
                                currentUser={currentUser}
                                activeFilter={activeFilter}
                                onFilterChange={setActiveFilter}
                                isLoading={isLoadingProblems}
                            />
                        </div>
                        <div className="lg:col-span-9 h-full flex flex-col gap-4">
                            <div className="flex-[3_3_0%]">
                                <ProblemView 
                                    problem={selectedProblem}
                                    currentUser={currentUser}
                                    onManageTestCases={setProblemToManage}
                                />
                            </div>
                            <div className="flex-[2_2_0%]">
                                <CodeEditor
                                    code={code}
                                    setCode={setCode}
                                    language={language}
                                    setLanguage={setLanguage}
                                    onSubmit={handleSubmitCode}
                                    isJudging={isJudging}
                                    canSubmit={!!selectedProblem && !isJudging}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {activeView === 'IDE' && <ResultDisplay result={submissionResult} />}
                {activeView === 'Submissions' && <SubmissionsView submissions={submissions} problems={problems} />}
                {activeView === 'UserManagement' && <UserManagementView users={users} currentUser={currentUser} onUpdateUserRole={handleUpdateUserRole} onDeleteUser={handleDeleteUser} />}
            </main>

            {problemToManage && (
                <TestCaseManager 
                    problem={problemToManage}
                    onClose={() => setProblemToManage(null)}
                    onSave={handleUpdateTestCases}
                />
            )}

            {isCreateProblemModalOpen && (
                <CreateProblemModal 
                    isOpen={isCreateProblemModalOpen}
                    onClose={() => setIsCreateProblemModalOpen(false)}
                    onCreate={handleCreateProblem}
                />
            )}

            {isGenerateProblemModalOpen && (
                <GenerateProblemAIModal 
                    isOpen={isGenerateProblemModalOpen}
                    onClose={() => setIsGenerateProblemModalOpen(false)}
                    onCreate={handleCreateProblem}
                />
            )}
            
            <ChangePasswordModal 
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                onSubmit={handleChangePassword}
            />

        </div>
    );
};

export default App;