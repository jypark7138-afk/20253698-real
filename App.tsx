import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  MessageCircle, 
  Target, 
  Trophy, 
  CheckCircle,
  Circle, 
  Send, 
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Leaf,
  Loader2
} from 'lucide-react';
import { Page, Quest, ChatMessage, LoadingState, QuestStep } from './types';
import { Button, Card, Input } from './components/Components';
import { chatWithCoach, generateMicroQuest } from './services/geminiService';

// --- MOCK DATA & UTILS ---
const INITIAL_QUESTS: Quest[] = [
  {
    id: '1',
    title: '햇빛 쐬기',
    category: 'health',
    createdAt: Date.now(),
    isCompleted: false,
    steps: [
      { id: '1-1', text: '창문 열기', isCompleted: true },
      { id: '1-2', text: '창밖 1분 바라보기', isCompleted: false },
    ]
  }
];

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- MAIN APP ---
export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  
  // Navigation Handler
  const renderPage = () => {
    switch(currentPage) {
      case Page.HOME: return <HomePage quests={quests} setQuests={setQuests} toQuest={() => setCurrentPage(Page.QUEST)} />;
      case Page.CHAT: return <ChatPage />;
      case Page.QUEST: return <QuestGeneratorPage onAddQuest={(q) => { setQuests([q, ...quests]); setCurrentPage(Page.HOME); }} />;
      case Page.STATS: return <StatsPage quests={quests} />;
      default: return <HomePage quests={quests} setQuests={setQuests} toQuest={() => setCurrentPage(Page.QUEST)} />;
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 text-gray-800 font-sans max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col relative">
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50">
        <NavButton 
          active={currentPage === Page.HOME} 
          onClick={() => setCurrentPage(Page.HOME)} 
          icon={<Home size={24} />} 
          label="홈" 
        />
        <NavButton 
          active={currentPage === Page.QUEST} 
          onClick={() => setCurrentPage(Page.QUEST)} 
          icon={<Target size={24} />} 
          label="퀘스트" 
        />
        <NavButton 
          active={currentPage === Page.CHAT} 
          onClick={() => setCurrentPage(Page.CHAT)} 
          icon={<MessageCircle size={24} />} 
          label="코치" 
        />
        <NavButton 
          active={currentPage === Page.STATS} 
          onClick={() => setCurrentPage(Page.STATS)} 
          icon={<Trophy size={24} />} 
          label="성장" 
        />
      </nav>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors duration-200 ${active ? 'text-sage-600' : 'text-gray-400 hover:text-gray-600'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

// --- PAGE: HOME ---
const HomePage = ({ quests, setQuests, toQuest }: { quests: Quest[], setQuests: React.Dispatch<React.SetStateAction<Quest[]>>, toQuest: () => void }) => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('좋은 아침이에요');
    else if (hour < 18) setGreeting('오후도 힘내봐요');
    else setGreeting('오늘 하루 수고했어요');
  }, []);

  const toggleStep = (questId: string, stepId: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id !== questId) return q;
      const newSteps = q.steps.map(s => s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s);
      const allCompleted = newSteps.every(s => s.isCompleted);
      return { ...q, steps: newSteps, isCompleted: allCompleted };
    }));
  };

  const activeQuests = quests.filter(q => !q.isCompleted);
  const completedToday = quests.filter(q => q.isCompleted).length;

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <header className="pt-6">
        <h1 className="text-2xl font-bold text-gray-800">{greeting}, <br/><span className="text-sage-500">작은 걸음</span>을 시작해볼까요?</h1>
      </header>

      {/* Stats Summary */}
      <div className="flex gap-4">
        <Card className="flex-1 bg-sage-100 border-none">
          <div className="flex flex-col">
            <span className="text-xs text-sage-600 font-semibold uppercase tracking-wider mb-1">오늘 완료</span>
            <span className="text-3xl font-bold text-sage-700">{completedToday}개</span>
          </div>
        </Card>
        <Card className="flex-1 bg-white">
           <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">에너지 레벨</span>
            <span className="text-3xl font-bold text-yellow-500">🌱</span>
          </div>
        </Card>
      </div>

      {/* Active Quests */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-sage-500" />
            진행 중인 퀘스트
          </h2>
          <button onClick={toQuest} className="text-sm text-sage-600 font-medium hover:underline">
            + 새 목표
          </button>
        </div>

        <div className="space-y-4">
          {activeQuests.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-400 mb-4">아직 등록된 퀘스트가 없어요.</p>
              <Button onClick={toQuest} variant="secondary" className="mx-auto text-sm py-2">
                아주 작은 목표 만들기
              </Button>
            </div>
          ) : (
            activeQuests.map(quest => (
              <Card key={quest.id} className="relative overflow-hidden group">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                    ${quest.category === 'study' ? 'bg-blue-100 text-blue-600' : 
                      quest.category === 'health' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {quest.category === 'study' ? '공부' : quest.category === 'health' ? '건강' : '생활'}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-4 text-gray-800">{quest.title}</h3>
                <div className="space-y-3">
                  {quest.steps.map(step => (
                    <div 
                      key={step.id} 
                      onClick={() => toggleStep(quest.id, step.id)}
                      className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {step.isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-sage-500 shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-300 shrink-0" />
                      )}
                      <span className={`text-sm ${step.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

// --- PAGE: QUEST GENERATOR ---
const QuestGeneratorPage = ({ onAddQuest }: { onAddQuest: (q: Quest) => void }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [generatedSteps, setGeneratedSteps] = useState<Omit<QuestStep, 'id' | 'isCompleted'>[]>([]);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading('loading');
    try {
      const steps = await generateMicroQuest(input);
      setGeneratedSteps(steps);
      setLoading('success');
    } catch (e) {
      setLoading('error');
    }
  };

  const handleConfirm = () => {
    const newQuest: Quest = {
      id: generateId(),
      title: input,
      category: 'life', // Simplified for demo
      isCompleted: false,
      createdAt: Date.now(),
      steps: generatedSteps.map(s => ({ ...s, id: generateId(), isCompleted: false }))
    };
    onAddQuest(newQuest);
  };

  return (
    <div className="p-6 h-full flex flex-col pt-12">
      <h2 className="text-2xl font-bold mb-2">어떤 것을 하고 싶나요?</h2>
      <p className="text-gray-500 mb-8">거창하지 않아도 괜찮아요. "방 청소", "영어 공부" 처럼 단순하게 적어주세요. AI가 아주 쉽게 쪼개드릴게요.</p>

      <div className="flex-1 space-y-6">
        <div className="relative">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예: 파이썬 공부하기, 산책하기..."
            className="pr-12"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button 
            onClick={handleGenerate}
            disabled={loading === 'loading' || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-500 disabled:text-gray-300"
          >
            <Sparkles size={20} />
          </button>
        </div>

        {loading === 'loading' && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-sage-500 animate-spin mx-auto mb-4" />
            <p className="text-sage-600 text-sm animate-pulse">실패 없는 아주 작은 계획을 세우고 있어요...</p>
          </div>
        )}

        {loading === 'success' && generatedSteps.length > 0 && (
          <div className="animate-slide-up space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-sage-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-sage-500" />
                추천 로드맵
              </h3>
              <ul className="space-y-4">
                {generatedSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{step.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button onClick={handleConfirm} className="w-full">
              이 퀘스트 시작하기
            </Button>
            <Button onClick={() => { setGeneratedSteps([]); setLoading('idle'); }} variant="ghost" className="w-full">
              다시 만들기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- PAGE: CHAT COACH ---
const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: '안녕하세요! 오늘 마음은 좀 어때요? 힘들면 힘들다고, 하기 싫으면 하기 싫다고 편하게 말해요. 저는 언제나 당신 편이에요. 🌱', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: ChatMessage = { id: generateId(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Prepare history for Gemini
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await chatWithCoach(userMsg.text, history);
      
      const botMsg: ChatMessage = { id: generateId(), role: 'model', text: responseText || "죄송해요, 잠시 생각이 꼬였어요. 다시 말해줄래요?", timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = { id: generateId(), role: 'model', text: "네트워크 연결이 불안정해요. 잠시 후 다시 시도해주세요.", timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Leaf className="w-5 h-5 text-sage-500" />
          AI 마음 코치
        </h2>
      </header>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-sand-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              ${msg.role === 'user' 
                ? 'bg-sage-500 text-white rounded-tr-none shadow-md shadow-sage-200' 
                : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none shadow-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-200">
               <div className="flex gap-1">
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="relative">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="지금 드는 생각을 편하게 적어보세요..."
            className="pr-12"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-500 disabled:text-gray-300 hover:text-sage-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- PAGE: STATS ---
const StatsPage = ({ quests }: { quests: Quest[] }) => {
  const completedCount = quests.filter(q => q.isCompleted).length;
  const totalCount = quests.length;
  const rate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="p-6 h-full space-y-6 pt-10">
      <h2 className="text-2xl font-bold text-gray-800">나의 성장 기록</h2>
      
      <Card className="bg-gradient-to-br from-sage-500 to-sage-600 text-white border-none shadow-lg shadow-sage-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sage-100 font-medium text-sm">총 달성률</span>
          <TrendingUp className="w-5 h-5 text-sage-200" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-bold">{rate}%</span>
          <span className="text-sage-200 mb-2 font-medium">조금씩 나아가고 있어요!</span>
        </div>
        <div className="mt-4 bg-black/20 rounded-full h-2 w-full overflow-hidden">
          <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${rate}%` }}></div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center py-8">
           <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
           <span className="text-2xl font-bold text-gray-800">{completedCount}</span>
           <span className="text-xs text-gray-500 mt-1">완료한 퀘스트</span>
        </Card>
        <Card className="flex flex-col items-center justify-center py-8">
           <Target className="w-8 h-8 text-blue-500 mb-2" />
           <span className="text-2xl font-bold text-gray-800">{totalCount}</span>
           <span className="text-xs text-gray-500 mt-1">도전한 목표</span>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">이번 주 응원 메시지</h3>
        <p className="text-gray-600 text-sm leading-relaxed italic">
          "속도는 중요하지 않아요. 방향이 중요하죠. 오늘 침대 밖으로 나온 것만으로도 당신은 이미 어제보다 성장했습니다."
        </p>
      </div>
    </div>
  );
};