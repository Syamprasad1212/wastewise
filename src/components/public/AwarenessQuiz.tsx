import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { speakText } from '../../lib/speech';
import { CheckCircle2, XCircle, RotateCcw, Award, Volume2 } from 'lucide-react';

interface Question {
  id: number;
  questionEn: string;
  questionTe: string;
  optionsEn: string[];
  optionsTe: string[];
  correctIndex: number;
  explanationEn: string;
  explanationTe: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    questionEn: 'Which bin should banana peels and kitchen vegetable scraps go into?',
    questionTe: 'అరటి తొక్కలు మరియు కూరగాయల వ్యర్థాలను ఏ రంగు డబ్బాలో వేయాలి?',
    optionsEn: ['Blue Bin (Dry)', 'Green Bin (Wet)', 'Red Box (Hazardous)', 'Yellow Bin (Sanitary)'],
    optionsTe: ['నీలి డబ్బా (పొడి)', 'ఆకుపచ్చ డబ్బా (తడి)', 'ఎరుపు డబ్బా (ప్రమాదకర)', 'పసుపు డబ్బా (శానిటరీ)'],
    correctIndex: 1,
    explanationEn: 'Correct! Green bin is for wet and biodegradable organic matter that turns into compost.',
    explanationTe: 'సరైన సమాధానం! ఆకుపచ్చ డబ్బా తడి చెత్త కోసం, ఇది సేంద్రీయ ఎరువుగా మారుతుంది.'
  },
  {
    id: 2,
    questionEn: 'How should used sanitary pads and baby diapers be disposed of?',
    questionTe: 'వాడిన శానిటరీ ప్యాడ్లు మరియు డైపర్లను ఎలా అందజేయాలి?',
    optionsEn: [
      'Throw in village canal or drain',
      'Mix with kitchen food scraps',
      'Wrap securely in newspaper with a red cross',
      'Burn in front of the house'
    ],
    optionsTe: [
      'కాలువలో లేదా డ్రైనేజీలో పారవేయాలి',
      'వంటగది ఆహార వ్యర్థాలతో కలపాలి',
      'వార్తాపత్రికలో గట్టిగా చుట్టి ఎరుపు గుర్తు పెట్టాలి',
      'ఇంటి ముందు తగలబెట్టాలి'
    ],
    correctIndex: 2,
    explanationEn: 'Correct! Wrapping with a red mark protects sanitation workers and prevents canal blockages.',
    explanationTe: 'సరైన సమాధానం! ఎరుపు గుర్తు పెట్టి చుట్టడం వల్ల కార్మికుల ఆరోగ్యం సురక్షితంగా ఉంటుంది.'
  },
  {
    id: 3,
    questionEn: 'What should you do before putting milk packets or oil pouches in the blue bin?',
    questionTe: 'పాల ప్యాకెట్లు లేదా నూనె కవర్లను నీలి డబ్బాలో వేసే ముందు ఏమి చేయాలి?',
    optionsEn: [
      'Throw with milk remaining inside',
      'Rinse with water and dry them',
      'Burn them immediately',
      'Bury them in garden soil'
    ],
    optionsTe: [
      'పాలు అలాగే ఉండగానే వేయాలి',
      'కొద్దిగా నీటితో కడిగి ఆరబెట్టాలి',
      'వెంటనే కాల్చేయాలి',
      'తోట మట్టిలో పాతిపెట్టాలి'
    ],
    correctIndex: 1,
    explanationEn: 'Correct! Rinsing prevents foul smells and keeps dry recyclables clean for processing.',
    explanationTe: 'సరైన సమాధానం! కొద్దిగా కడగడం వల్ల దుర్వాసన రాదు, రీసైక్లింగ్ సులువవుతుంది.'
  },
  {
    id: 4,
    questionEn: 'Why should fallen dry leaves never be burnt in the village?',
    questionTe: 'రాలిన ఎండిన ఆకులను గ్రామంలో ఎందుకు కాల్చకూడదు?',
    optionsEn: [
      'Burning creates toxic smoke and destroys valuable compost material',
      'It brings good smell',
      'It is required by Panchayat',
      'Leaves never catch fire'
    ],
    optionsTe: [
      'కాల్చడం వల్ల విషపూరిత పొగ వచ్చి, ఎరువుగా మారే ఆకులు బూడిదవుతాయి',
      'మంచి సువాసన వస్తుంది',
      'పంచాయతీ నియమం ప్రకారం కాల్చాలి',
      'ఆకులు ఎప్పుడూ కాలవు'
    ],
    correctIndex: 0,
    explanationEn: 'Correct! Burning leaves releases harmful carbon smoke and asthmatic irritants. Composting creates free fertilizer.',
    explanationTe: 'సరైన సమాధానం! ఆకులు కాల్చితే దగ్గు, ఆస్తమా తెచ్చే పొగ వస్తుంది. కంపోస్ట్ చేస్తే మంచి ఎరువు అవుతుంది.'
  },
  {
    id: 5,
    questionEn: 'Where should empty pesticide and weedicide bottles from farms be placed?',
    questionTe: 'వ్యవసాయ పురుగుమందులు, కలుపు మందుల ఖాళీ డబ్బాలను ఎక్కడ వేయాలి?',
    optionsEn: [
      'In the village drinking water pond',
      'Use for drinking water at home',
      'In the Red Hazardous Waste collection box',
      'Leave in open crop fields'
    ],
    optionsTe: [
      'గ్రామ మంచినీటి చెరువులో వేయాలి',
      'ఇంట్లో మంచినీటి కోసం వాడాలి',
      'ఎరుపు రంగు ప్రమాదకర వ్యర్థాల డబ్బాలో వేయాలి',
      'పొలాల్లో అలాగే వదిలేయాలి'
    ],
    correctIndex: 2,
    explanationEn: 'Correct! Pesticide containers carry dangerous chemical residues and belong only in red hazardous disposal drives.',
    explanationTe: 'సరైన సమాధానం! పురుగుమందు డబ్బాల్లో విష రసాయనాలుంటాయి; వాటిని ఎరుపు డబ్బాలోనే ఇవ్వాలి.'
  }
];

export const AwarenessQuiz: React.FC = () => {
  const { language } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const q = QUIZ_QUESTIONS[currentIdx];

  const handleSelect = (idx: number) => {
    if (selectedAnswer !== null) return; // already answered
    setSelectedAnswer(idx);
    if (idx === q.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);
  };

  const handleReadQuestion = () => {
    const text = language === 'te' ? q.questionTe : q.questionEn;
    speakText(text, language);
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-md p-6 sm:p-8">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-2.5 py-0.5 rounded">
            {language === 'te' ? 'గ్రామ పరిజ్ఞాన క్విజ్' : 'Village Waste Awareness Quiz'}
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">
            {language === 'te' ? 'మీరు ఎంత బాగా వేరు చేయగలరు?' : 'Test Your Waste Segregation Knowledge'}
          </h3>
        </div>

        {!quizFinished && (
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase">Question</div>
            <div className="text-lg font-black text-forest-700">{currentIdx + 1} / {QUIZ_QUESTIONS.length}</div>
          </div>
        )}
      </div>

      {!quizFinished ? (
        <div className="space-y-6">
          {/* Question Text */}
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">
              {language === 'te' ? q.questionTe : q.questionEn}
            </h4>
            <button
              onClick={handleReadQuestion}
              className="p-2 text-slate-400 hover:text-forest-700 hover:bg-forest-50 rounded-full transition"
              title="Listen to question"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {(language === 'te' ? q.optionsTe : q.optionsEn).map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === q.correctIndex;
              let btnStyle = 'border-slate-200 hover:border-forest-400 hover:bg-slate-50 text-slate-800';

              if (selectedAnswer !== null) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                } else if (isSelected) {
                  btnStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                } else {
                  btnStyle = 'border-slate-200 opacity-60 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={selectedAnswer !== null}
                  className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center justify-between text-sm sm:text-base ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {selectedAnswer !== null && (
                    <span>
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Alert */}
          {selectedAnswer !== null && (
            <div className={`p-4 rounded-xl text-sm ${selectedAnswer === q.correctIndex ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}>
              <div className="font-bold mb-1">
                {selectedAnswer === q.correctIndex ? (language === 'te' ? '✅ అద్భుతం!' : '✅ Great Job!') : (language === 'te' ? 'ℹ️ సరైన వివరణ:' : 'ℹ️ Note:')}
              </div>
              <p>{language === 'te' ? q.explanationTe : q.explanationEn}</p>
            </div>
          )}

          {/* Next Button */}
          {selectedAnswer !== null && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-2.5 rounded-xl shadow transition"
              >
                {currentIdx < QUIZ_QUESTIONS.length - 1
                  ? (language === 'te' ? 'తదుపరి ప్రశ్న →' : 'Next Question →')
                  : (language === 'te' ? 'ఫలితం చూడండి' : 'View Results')}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Result Screen */
        <div className="text-center py-6 space-y-4">
          <div className="w-20 h-20 rounded-full bg-forest-100 text-forest-700 mx-auto flex items-center justify-center">
            <Award className="w-10 h-10" />
          </div>

          <h4 className="text-2xl font-black text-slate-900">
            {language === 'te' ? 'క్విజ్ పూర్తయింది!' : 'Quiz Completed!'}
          </h4>

          <p className="text-lg text-slate-700 font-semibold">
            {language === 'te' ? `మీ స్కోరు: ${score} / ${QUIZ_QUESTIONS.length}` : `Your Score: ${score} out of ${QUIZ_QUESTIONS.length}`}
          </p>

          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {score >= 4
              ? (language === 'te' ? 'అభినందనలు! మీరు ఆదర్శ స్వచ్ఛ గ్రామ మిత్రులు! మీ ఇంట్లో విభజన పద్ధతులను కొనసాగించండి.' : 'Excellent! You are a certified Clean Village Champion! Keep leading the way.')
              : (language === 'te' ? 'మంచి ప్రయత్నం! మన గ్రామంలో మరింత పరిశుభ్రత కోసం గైడ్‌లోని సూచనలను ఒకసారి చూడండి.' : 'Good effort! Check the Waste Identification Guide to brush up on segregation.')}
          </p>

          <div className="pt-4">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-2.5 rounded-xl transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'te' ? 'మరలా ప్రయత్నించండి' : 'Try Again'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
