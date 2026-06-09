import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  PenTool, 
  Calendar, 
  User, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  ChevronRight,
  BrainCircuit,
  GraduationCap,
  LayoutDashboard,
  Search,
  Send,
  Loader2,
  Mic,
  Camera,
  Image as ImageIcon,
  Trophy,
  Award,
  Star,
  X,
  Users,
  MessageCircle,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getStudyAnswer, generateQuiz, generateStudyDiagram } from './services/geminiService';
import type { Note, ScheduleItem, Progress, ChatMessage, Subject, User as UserType, LeaderboardEntry, Group, GroupMessage, GroupNote } from './types';
import { io, Socket } from 'socket.io-client';

const SUBJECTS: Subject[] = ['Mathematics', 'Science', 'Biology', 'Physics', 'Chemistry', 'English'];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [notes, setNotes] = useState<Note[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notes State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', subject: 'Mathematics' as Subject });

  // Planner State
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ task: '', time: '', day: 'Monday' });

  // Quiz State
  const [quizSubject, setQuizSubject] = useState<Subject | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Group State
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [groupNotes, setGroupNotes] = useState<GroupNote[]>([]);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [groupTab, setGroupTab] = useState<'chat' | 'notes'>('chat');
  const [groupChatInput, setGroupChatInput] = useState('');
  const [isAddingGroupNote, setIsAddingGroupNote] = useState(false);
  const [newGroupNote, setNewGroupNote] = useState({ title: '', content: '' });
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetchData();
    
    // Initialize Socket
    socketRef.current = io();
    
    socketRef.current.on('new-message', (message: GroupMessage) => {
      setGroupMessages(prev => [...prev, message]);
    });

    socketRef.current.on('note-updated', (note: GroupNote) => {
      setGroupNotes(prev => {
        const index = prev.findIndex(n => n.id === note.id);
        if (index !== -1) {
          const newNotes = [...prev];
          newNotes[index] = note;
          return newNotes;
        }
        return [note, ...prev];
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const fetchData = async () => {
    try {
      const [notesRes, scheduleRes, progressRes, userRes, leaderboardRes] = await Promise.all([
        fetch('/api/notes'),
        fetch('/api/schedule'),
        fetch('/api/progress'),
        fetch('/api/user/1'),
        fetch('/api/leaderboard')
      ]);
      setNotes(await notesRes.json());
      setSchedule(await scheduleRes.json());
      setProgress(await progressRes.json());
      setUser(await userRes.json());
      setLeaderboard(await leaderboardRes.json());
      
      // Fetch groups
      const groupsRes = await fetch('/api/groups');
      setGroups(await groupsRes.json());
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() && !selectedImage) return;
    
    const userMsg: ChatMessage = { 
      role: 'user', 
      text: chatInput,
      image: selectedImage || undefined
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = chatInput;
    const currentImage = selectedImage;
    
    setChatInput('');
    setSelectedImage(null);
    setIsChatLoading(true);

    try {
      const answer = await getStudyAnswer(currentInput || "Analyze this image", currentImage || undefined);
      
      let aiImage: string | null = null;
      if (currentInput.toLowerCase().includes('diagram') || currentInput.toLowerCase().includes('visualize')) {
        aiImage = await generateStudyDiagram(currentInput);
      }

      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: answer || 'Sorry, I couldn\'t find an answer.',
        image: aiImage || undefined
      }]);

      // Award points for asking questions
      await fetch('/api/user/1/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: 10 })
      });

      // Check for Quick Learner badge
      const userQuestions = chatMessages.filter(m => m.role === 'user').length + 1;
      if (userQuestions >= 5) {
        await fetch('/api/user/1/badge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ badge_name: 'Quick Learner', icon: '⚡' })
        });
      }

      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(prev => prev + ' ' + transcript);
    };

    recognition.start();
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.title.trim()) return;
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      });
      
      // Award points for notes
      await fetch('/api/user/1/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: 20 })
      });

      // Check for Note Taker badge
      if (notes.length + 1 >= 3) {
        await fetch('/api/user/1/badge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ badge_name: 'Note Taker', icon: '📝' })
        });
      }

      setIsAddingNote(false);
      setNewNote({ title: '', content: '', subject: 'Mathematics' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSchedule = async (item: ScheduleItem) => {
    try {
      await fetch(`/api/schedule/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !item.completed })
      });
      
      if (!item.completed) {
        await fetch('/api/user/1/points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: 15 })
        });

        // Check for Planner badge
        const completedCount = schedule.filter(s => s.completed).length + 1;
        if (completedCount >= 5) {
          await fetch('/api/user/1/badge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ badge_name: 'Planner', icon: '📅' })
          });
        }
      }
      
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.task.trim()) return;
    try {
      await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule)
      });
      setIsAddingSchedule(false);
      setNewSchedule({ task: '', time: '', day: 'Monday' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    try {
      await fetch(`/api/schedule/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const startQuiz = async (subject: Subject) => {
    setQuizSubject(subject);
    setIsQuizLoading(true);
    setQuizQuestions([]);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
    try {
      const questions = await generateQuiz(subject);
      setQuizQuestions(questions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleQuizAnswer = (index: number) => {
    if (index === quizQuestions[currentQuizIndex].answer) {
      setQuizScore(prev => prev + 1);
    }
    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      const finalScore = quizScore + (index === quizQuestions[currentQuizIndex].answer ? 1 : 0);
      
      // Save progress
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: quizSubject, score: finalScore, total: quizQuestions.length })
      }).then(() => {
        // Award points for quiz
        fetch('/api/user/1/points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: finalScore * 10 })
        }).then(() => {
          // Check for Quiz Master badge
          if (finalScore === quizQuestions.length && quizQuestions.length > 0) {
            fetch('/api/user/1/badge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ badge_name: 'Quiz Master', icon: '🏆' })
            });
          }

          // Check for Early Bird (Daily Challenge)
          const today = new Date().toISOString().split('T')[0];
          const todayQuizzes = progress.filter(p => p.date.startsWith(today)).length + 1;
          if (todayQuizzes >= 1) { // For demo, 1 quiz is enough to trigger challenge check
            fetch('/api/user/1/badge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ badge_name: 'Early Bird', icon: '🌅' })
            });
          }
          
          fetchData();
        });
      });
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return;
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newGroup, userId: 1 })
      });
      const data = await res.json();
      setIsAddingGroup(false);
      setNewGroup({ name: '', description: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1 })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openGroup = async (group: Group) => {
    setActiveGroup(group);
    socketRef.current?.emit('join-group', group.id);
    
    const [msgRes, noteRes] = await Promise.all([
      fetch(`/api/groups/${group.id}/messages`),
      fetch(`/api/groups/${group.id}/notes`)
    ]);
    setGroupMessages(await msgRes.json());
    setGroupNotes(await noteRes.json());
  };

  const handleSendGroupMessage = () => {
    if (!groupChatInput.trim() || !activeGroup) return;
    socketRef.current?.emit('send-message', {
      groupId: activeGroup.id,
      userId: 1,
      text: groupChatInput
    });
    setGroupChatInput('');
  };

  const handleAddGroupNote = async () => {
    if (!newGroupNote.title.trim() || !activeGroup) return;
    try {
      const res = await fetch(`/api/groups/${activeGroup.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newGroupNote, userId: 1 })
      });
      const data = await res.json();
      
      socketRef.current?.emit('update-note', {
        noteId: data.id,
        groupId: activeGroup.id,
        title: newGroupNote.title,
        content: newGroupNote.content,
        userId: 1
      });

      setIsAddingGroupNote(false);
      setNewGroupNote({ title: '', content: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const renderHome = () => (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Hello, {user?.name || 'Student'}! 👋</h1>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-slate-500 text-sm">Level {user?.level || 1}</p>
            <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500" 
                style={{ width: `${(user?.points || 0) % 100}%` }}
              />
            </div>
            <p className="text-slate-400 text-[10px]">{user?.points || 0} pts</p>
          </div>
        </div>
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center border-2 border-indigo-200 shrink-0">
          <User className="text-indigo-600" />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('chat')}
          className="p-4 bg-indigo-600 rounded-2xl text-white flex flex-col items-start space-y-2 shadow-lg shadow-indigo-200"
        >
          <BrainCircuit className="w-6 h-6" />
          <span className="font-semibold">AI Assistant</span>
        </button>
        <button 
          onClick={() => setActiveTab('quiz')}
          className="p-4 bg-emerald-500 rounded-2xl text-white flex flex-col items-start space-y-2 shadow-lg shadow-emerald-200"
        >
          <GraduationCap className="w-6 h-6" />
          <span className="font-semibold">Practice Quiz</span>
        </button>
      </div>

      <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <Trophy className="w-5 h-5 text-amber-500 mr-2" />
            Leaderboard
          </h2>
          <button onClick={() => setActiveTab('profile')} className="text-indigo-600 text-xs font-bold">View Rank</button>
        </div>
        <div className="space-y-3">
          {leaderboard.slice(0, 3).map((entry, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-amber-100 text-amber-600' : 
                  i === 1 ? 'bg-slate-100 text-slate-600' : 
                  'bg-orange-100 text-orange-600'
                }`}>
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-slate-700">{entry.name}</span>
              </div>
              <span className="text-xs font-bold text-slate-400">{entry.points} pts</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">Recent Notes</h2>
          <button onClick={() => setActiveTab('notes')} className="text-indigo-600 text-sm font-medium">View All</button>
        </div>
        <div className="space-y-3">
          {notes.slice(0, 2).map(note => (
            <div key={note.id} className="p-4 bg-white rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
              <div>
                <h3 className="font-semibold text-slate-800">{note.title}</h3>
                <p className="text-xs text-slate-400">{note.subject} • {new Date(note.updated_at).toLocaleDateString()}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderChat = () => (
    <div className="flex flex-col h-full max-h-[calc(100vh-160px)]">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-hide">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'}`}>
              {msg.image && (
                <img src={msg.image} alt="Upload" className="w-full rounded-xl mb-2 max-h-48 object-cover" />
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center space-x-2 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-xs text-slate-500">AI is analyzing...</span>
            </div>
          </div>
        )}
        {chatMessages.length === 0 && (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BrainCircuit className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Study Assistant</h2>
            <p className="text-slate-500 text-sm px-10">Ask by text, voice, or photo! I can even generate diagrams for you.</p>
          </div>
        )}
      </div>

      <div className="pt-4 space-y-3">
        {selectedImage && (
          <div className="relative inline-block">
            <img src={selectedImage} alt="Selected" className="w-20 h-20 rounded-xl object-cover border-2 border-indigo-500" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-2xl px-3 py-1 focus-within:ring-2 focus-within:ring-indigo-500 shadow-sm relative overflow-hidden">
            {isListening && (
              <div className="absolute inset-0 bg-red-50/80 backdrop-blur-[1px] flex items-center px-4 space-x-2 z-10">
                <div className="flex space-x-1">
                  {[1, 2, 3].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ height: [4, 12, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-red-500 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-red-600 animate-pulse">Listening...</span>
              </div>
            )}
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type or use voice..."
              className="flex-1 p-2 bg-transparent focus:outline-none text-sm"
            />
            <button 
              onClick={handleVoiceInput}
              className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <button 
            onClick={handleSendMessage}
            disabled={isChatLoading}
            className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">My Notes</h2>
        <button 
          onClick={() => setIsAddingNote(true)}
          className="p-2 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {notes.map(note => (
          <div key={note.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm relative group">
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                {note.subject}
              </span>
              <button 
                onClick={() => handleDeleteNote(note.id)}
                className="text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">{note.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-3">{note.content}</p>
            <p className="text-[10px] text-slate-400 mt-3">{new Date(note.updated_at).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isAddingNote && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 bg-white p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">New Note</h3>
              <button onClick={() => setIsAddingNote(false)} className="text-slate-400">Cancel</button>
            </div>
            <div className="space-y-4 flex-1">
              <input 
                type="text" 
                placeholder="Title"
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                className="w-full text-2xl font-bold focus:outline-none"
              />
              <select 
                value={newNote.subject}
                onChange={(e) => setNewNote({...newNote, subject: e.target.value as Subject})}
                className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200"
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea 
                placeholder="Start writing..."
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                className="w-full flex-1 resize-none focus:outline-none text-slate-700"
              />
            </div>
            <button 
              onClick={handleAddNote}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 mt-4"
            >
              Save Note
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderQuiz = () => (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-bold text-slate-800">Practice Quizzes</h2>
      
      {!quizSubject ? (
        <div className="grid grid-cols-2 gap-4">
          {SUBJECTS.map(subject => (
            <button 
              key={subject}
              onClick={() => startQuiz(subject)}
              className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-500 transition-all text-center group"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-600 transition-colors">
                <BookOpen className="w-6 h-6 text-indigo-600 group-hover:text-white" />
              </div>
              <span className="font-bold text-slate-700">{subject}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
          {isQuizLoading ? (
            <div className="py-20 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
              <p className="text-slate-500">Generating your {quizSubject} quiz...</p>
            </div>
          ) : quizFinished ? (
            <div className="text-center py-10 space-y-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Quiz Completed!</h3>
                <p className="text-slate-500">You scored {quizScore} out of {quizQuestions.length}</p>
                <p className="text-indigo-600 font-bold mt-2">+{quizScore * 10} Points Earned!</p>
              </div>
              <button 
                onClick={() => setQuizSubject(null)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold"
              >
                Back to Subjects
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{quizSubject} Quiz</span>
                <span className="text-xs text-slate-400">Question {currentQuizIndex + 1}/{quizQuestions.length}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300" 
                  style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{quizQuestions[currentQuizIndex]?.question}</h3>
              <div className="space-y-3">
                {quizQuestions[currentQuizIndex]?.options.map((option: string, i: number) => (
                  <button 
                    key={i}
                    onClick={() => handleQuizAnswer(i)}
                    className="w-full p-4 text-left border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-500 transition-all text-slate-700"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPlanner = () => (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-bold text-slate-800">Study Planner</h2>
      
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
          <button 
            key={day}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
              new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day 
              ? 'bg-indigo-600 text-white' 
              : 'bg-slate-100 text-slate-500'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {schedule.map(item => (
          <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => handleToggleSchedule(item)}>
                {item.completed ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-slate-300" />}
              </button>
              <div>
                <h4 className={`font-bold ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.task}</h4>
                <p className="text-xs text-slate-400">{item.time} • {item.day}</p>
              </div>
            </div>
            <button 
              onClick={() => handleDeleteSchedule(item.id)}
              className="text-slate-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button 
          onClick={() => setIsAddingSchedule(true)}
          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Study Session</span>
        </button>
      </div>

      <AnimatePresence>
        {isAddingSchedule && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">New Session</h3>
                <button onClick={() => setIsAddingSchedule(false)} className="text-slate-400"><X /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Task Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Math Homework"
                    value={newSchedule.task}
                    onChange={(e) => setNewSchedule({...newSchedule, task: e.target.value})}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Time</label>
                    <input 
                      type="time" 
                      value={newSchedule.time}
                      onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Day</label>
                    <select 
                      value={newSchedule.day}
                      onChange={(e) => setNewSchedule({...newSchedule, day: e.target.value})}
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleAddSchedule}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 mt-6"
              >
                Add to Schedule
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8 pb-20">
      <div className="text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg relative">
          <User className="w-12 h-12 text-indigo-600" />
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white">
            LVL {user?.level || 1}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{user?.name || 'Rohit Yadav'}</h2>
        <div className="max-w-[200px] mx-auto mt-2">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
            <span>Progress to Lvl {(user?.level || 1) + 1}</span>
            <span>{(user?.points || 0) % 100}/100</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000" 
              style={{ width: `${(user?.points || 0) % 100}%` }}
            />
          </div>
        </div>
        <p className="text-slate-500 mt-2 text-sm">{user?.points || 0} Total Points</p>
      </div>

      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <Award className="w-5 h-5 text-indigo-600 mr-2" />
          Badges Earned
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {user?.badges.map((badge, i) => (
            <div key={i} className="flex flex-col items-center space-y-1">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100">
                <span className="text-xl">{badge.icon}</span>
              </div>
              <span className="text-[10px] text-slate-500 text-center font-medium">{badge.badge_name}</span>
            </div>
          ))}
          {(!user?.badges || user.badges.length === 0) && (
            <div className="col-span-4 py-4 text-center text-slate-400 text-sm italic">
              Solve quizzes to earn badges!
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Learning Progress</h3>
        <div className="space-y-4">
          {SUBJECTS.map(subject => {
            const subProgress = progress.filter(p => p.subject === subject);
            const totalScore = subProgress.reduce((acc, curr) => acc + curr.score, 0);
            const totalPossible = subProgress.reduce((acc, curr) => acc + curr.total, 0);
            const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

            return (
              <div key={subject} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{subject}</span>
                  <span className="text-slate-400">{Math.round(percentage)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          Daily Challenge
        </h3>
        <p className="text-indigo-100 text-sm mb-4">Complete 3 quiz questions today to earn the "Early Bird" badge!</p>
        <button 
          onClick={() => setActiveTab('quiz')}
          className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm"
        >
          Start Challenge
        </button>
      </section>
    </div>
  );

  const renderGroups = () => (
    <div className="space-y-6 pb-20 h-full flex flex-col">
      {!activeGroup ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Study Groups</h2>
            <button 
              onClick={() => setIsAddingGroup(true)}
              className="p-2 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 scrollbar-hide">
            {groups.map(group => (
              <div key={group.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">{group.name}</h3>
                  <p className="text-xs text-slate-400">{group.member_count} members • {group.description}</p>
                </div>
                <button 
                  onClick={() => openGroup(group)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold"
                >
                  Enter
                </button>
              </div>
            ))}
            {groups.length === 0 && (
              <div className="text-center py-10 text-slate-400 italic">
                No groups found. Create one to start collaborating!
              </div>
            )}
          </div>

          <AnimatePresence>
            {isAddingGroup && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-6"
              >
                <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Create Group</h3>
                    <button onClick={() => setIsAddingGroup(false)} className="text-slate-400"><X /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Group Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Physics Study Squad"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Description</label>
                      <textarea 
                        placeholder="What's this group about?"
                        value={newGroup.description}
                        onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleCreateGroup}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 mt-6"
                  >
                    Create Group
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex items-center space-x-4 mb-6">
            <button onClick={() => setActiveGroup(null)} className="p-2 bg-slate-100 rounded-xl text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{activeGroup.name}</h2>
              <div className="flex space-x-4 mt-1">
                <button 
                  onClick={() => setGroupTab('chat')}
                  className={`text-xs font-bold uppercase tracking-widest ${groupTab === 'chat' ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                  Chat
                </button>
                <button 
                  onClick={() => setGroupTab('notes')}
                  className={`text-xs font-bold uppercase tracking-widest ${groupTab === 'notes' ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                  Shared Notes
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {groupTab === 'chat' ? (
              <div className="space-y-4 pb-4">
                {groupMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.user_id === 1 ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[85%]">
                      <p className="text-[10px] font-bold text-slate-400 mb-1 px-1">{msg.user_name}</p>
                      <div className={`p-3 rounded-2xl ${msg.user_id === 1 ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'}`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {groupMessages.length === 0 && (
                  <div className="text-center py-10 text-slate-400 italic">No messages yet. Say hi!</div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-700">Group Notes</h3>
                  <button 
                    onClick={() => setIsAddingGroupNote(true)}
                    className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {groupNotes.map(note => (
                  <div key={note.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-1">{note.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2">{note.content}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10px] text-slate-400">Updated by {note.updated_by_name}</span>
                      <span className="text-[10px] text-slate-400">{new Date(note.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {groupNotes.length === 0 && (
                  <div className="text-center py-10 text-slate-400 italic">No shared notes yet.</div>
                )}
              </div>
            )}
          </div>

          {groupTab === 'chat' && (
            <div className="pt-4 flex items-center space-x-2">
              <input 
                type="text" 
                value={groupChatInput}
                onChange={(e) => setGroupChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendGroupMessage()}
                placeholder="Message group..."
                className="flex-1 p-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
              <button 
                onClick={handleSendGroupMessage}
                className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          )}

          <AnimatePresence>
            {isAddingGroupNote && (
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed inset-0 z-50 bg-white p-6 flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">New Group Note</h3>
                  <button onClick={() => setIsAddingGroupNote(false)} className="text-slate-400">Cancel</button>
                </div>
                <div className="space-y-4 flex-1">
                  <input 
                    type="text" 
                    placeholder="Note Title"
                    value={newGroupNote.title}
                    onChange={(e) => setNewGroupNote({...newGroupNote, title: e.target.value})}
                    className="w-full text-2xl font-bold focus:outline-none"
                  />
                  <textarea 
                    placeholder="Start collaborating..."
                    value={newGroupNote.content}
                    onChange={(e) => setNewGroupNote({...newGroupNote, content: e.target.value})}
                    className="w-full flex-1 resize-none focus:outline-none text-slate-700"
                  />
                </div>
                <button 
                  onClick={handleAddGroupNote}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 mt-4"
                >
                  Save to Group
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'home' && renderHome()}
              {activeTab === 'chat' && renderChat()}
              {activeTab === 'groups' && renderGroups()}
              {activeTab === 'notes' && renderNotes()}
              {activeTab === 'quiz' && renderQuiz()}
              {activeTab === 'planner' && renderPlanner()}
              {activeTab === 'profile' && renderProfile()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center z-40">
          <button onClick={() => setActiveTab('home')} className={`p-2 rounded-xl transition-colors ${activeTab === 'home' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
            <Home className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab('chat')} className={`p-2 rounded-xl transition-colors ${activeTab === 'chat' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
            <MessageSquare className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab('groups')} className={`p-2 rounded-xl transition-colors ${activeTab === 'groups' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
            <Users className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab('notes')} className={`p-2 rounded-xl transition-colors ${activeTab === 'notes' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
            <BookOpen className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab('quiz')} className={`p-2 rounded-xl transition-colors ${activeTab === 'quiz' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
            <GraduationCap className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab('planner')} className={`p-2 rounded-xl transition-colors ${activeTab === 'planner' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
            <Calendar className="w-6 h-6" />
          </button>
          <button onClick={() => setActiveTab('profile')} className={`p-2 rounded-xl transition-colors ${activeTab === 'profile' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
            <User className="w-6 h-6" />
          </button>
        </nav>
      </div>
    </div>
  );
}
