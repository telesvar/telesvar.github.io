import { createElement, useState, useMemo, useEffect } from 'react';
import type { ReactElement } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Share2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

interface Question {
  text: string;
  scoreYes: boolean;
}

type Answers = {
  [key: number]: 'yes' | 'no';
};

interface MotivationResult {
  type: string;
  description: ReactElement;
  icon: LucideIcon;
}

function App() {
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [isShared, setIsShared] = useState(false);

  // Define survey questions with their scoring type
  const questions: Question[] = [
    { text: "I have the an optimism for success when starting a task.", scoreYes: true },
    { text: "I’m active in my job.", scoreYes: true },
    { text: "I show initiative.", scoreYes: true },
    { text: "In fulfilling the responsible tasks, I try to find justifiable reasons for refusing to fulfill these tasks.", scoreYes: false },
    { text: "I often choose extremes: either too easy or too complicated tasks.", scoreYes: false },
    { text: "I never leave obstacles while facing difficult situations, but I’m looking for ways to overcome them.", scoreYes: true },
    { text: "When the success is mixed with failing, I tend to overestimate my own success.", scoreYes: false },
    { text: "The productivity of my actions, above all, depends on my own purpose, not on external control.", scoreYes: true },
    { text: "Fulfilling difficult-enough tasks in a limited time frame, my work results get worse.", scoreYes: false },
    { text: "Usually I’m persistent in achieving the set goal.", scoreYes: true },
    { text: "I usually plan my future quite a long way ahead.", scoreYes: true },
    { text: "If i have to take risks, I do it carefully, mindfully, not impulsevly with prudence.", scoreYes: true },
    { text: "I am not particularly persistent in achieving the goal, especially in the absence of external control.", scoreYes: false },
    { text: "Typically, I put myself on either an averagely complex or very complicated but achievable task, rather than setting myself unrealistically high goals.", scoreYes: true },
    { text: "If, in the course of any task, I fail, then this task for me loses it’s attraction.", scoreYes: false },
    { text: "When the success is mixed with failing, I tend to exaggerate my failures.", scoreYes: true },
    { text: "I usually plan my future for the near future.", scoreYes: false },
    { text: "Working under limited time conditions, the results of my work tend to improve, even if the task is quite complicated.", scoreYes: true },
    { text: "If I fail to complete a task, I don’t give up on my goal.", scoreYes: true },
    { text: "If I have chosen a task myself, in the event of a failure, its attractiveness increases even more.", scoreYes: true }
  ];

  // Load answers from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const decodedData = JSON.parse(atob(hash));
        if (decodedData && typeof decodedData === 'object') {
          setAnswers(decodedData as Answers);
          setShowResult(true);
          setIsShared(true);
        }
      } catch (e) {
        console.error('Failed to parse URL data');
      }
    }
  }, []);

  // Update URL when showing results
  useEffect(() => {
    if (showResult && Object.keys(answers).length === questions.length) {
      const encodedData = btoa(JSON.stringify(answers));
      window.history.replaceState(null, '', `#${encodedData}`);
    } else if (!showResult && !isShared) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [showResult, answers, isShared, questions.length]);

  const progress = useMemo(() => {
    return (Object.keys(answers).length / questions.length) * 100;
  }, [answers, questions.length]);

  const handleAnswer = (index: number, answer: 'yes' | 'no'): void => {
    setAnswers(prev => ({
      ...prev,
      [index]: answer
    }));
    setShowResult(false);
  };

  const calculateScore = (): number => {
    let score = 0;
    Object.entries(answers).forEach(([index, answer]) => {
      const question = questions[parseInt(index)];
      if ((question.scoreYes && answer === 'yes') || (!question.scoreYes && answer === 'no')) {
        score++;
      }
    });
    return score;
  };

  const getMotivationResult = (score: number): MotivationResult => {
    if (score <= 7) {
      return {
        type: "Motivation to Avoid Failures",
        description: (
          <>
            <p className="mb-4">
              Your responses indicate a predominant motivation to avoid failures. This means you tend to focus on preventing negative outcomes rather than achieving positive ones.
            </p>
            <p className="mb-2">People with this motivation type often:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Experience increased anxiety about potential failures</li>
              <li>Show caution in taking on responsibilities</li>
              <li>Prefer to avoid risky situations</li>
              <li>May have lower self-confidence</li>
              <li>Are particularly careful with important tasks</li>
            </ul>
          </>
        ),
        icon: AlertCircle
      };
    } else if (score >= 14) {
      return {
        type: "Motivation for Success",
        description: (
          <>
            <p className="mb-4">
              Your responses indicate a strong motivation for success. You approach tasks with optimism and confidence.
            </p>
            <p className="mb-2">Characteristics of this motivation type include:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Taking initiative and showing persistence</li>
              <li>Believing in your own capabilities</li>
              <li>Being responsible and action-oriented</li>
              <li>Setting challenging but achievable goals</li>
              <li>Maintaining focus on positive outcomes</li>
            </ul>
          </>
        ),
        icon: CheckCircle2
      };
    } else {
      const leaning = score <= 9
        ? " with a slight tendency towards avoiding failure"
        : score >= 12
          ? " with a slight tendency towards success motivation"
          : "";
      return {
        type: "Mixed Motivation",
        description: (
          <>
            <p className="mb-4">
              Your motivation style is not strongly pronounced{leaning}. You likely show flexibility in your approach to challenges, drawing from both motivation types depending on the situation.
            </p>
            <p className="mb-2">This can be advantageous as it allows you to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Adapt your approach based on the context</li>
              <li>Balance risk-taking with caution</li>
              <li>Maintain realistic expectations</li>
              <li>Consider both potential successes and failures</li>
              <li>Learn from both positive and negative experiences</li>
            </ul>
          </>
        ),
        icon: AlertCircle
      };
    }
  };

  const handleReset = (): void => {
    setAnswers({});
    setShowResult(false);
    setIsShared(false);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleShare = async (): Promise<void> => {
    const currentUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast("Link Copied!");
    } catch (err) {
      toast("Couldn't copy link");
    }
  };

  const isComplete = Object.keys(answers).length === questions.length;

  return (
    <Card className="w-full max-w-3xl mx-auto my-4">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">A.A.Rean’s Motivation Survey</CardTitle>
        <CardDescription>Assess your dominant motivation type</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isShared && (
          <Alert className="p-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Instructions</AlertTitle>
            <AlertDescription>
              Answer “yes” or “no” to each question without overthinking. Your first instinct is usually the most accurate:
              <ul className="list-disc">
                <li>“yes” can mean either “I agree” or “more yes than no”</li>
                <li>“no” can mean either “I disagree” or “more no than yes”</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {!isShared && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="space-y-3 p-4 rounded-lg bg-gray-50">
              <p className="font-medium">
                {index + 1}. {question.text}
              </p>
              <div className="space-x-4">
                <Button
                  variant={answers[index] === 'yes' ? 'default' : 'outline'}
                  onClick={() => handleAnswer(index, 'yes')}
                  className="w-20"
                  disabled={isShared}
                >
                  Yes
                </Button>
                <Button
                  variant={answers[index] === 'no' ? 'default' : 'outline'}
                  onClick={() => handleAnswer(index, 'no')}
                  className="w-20"
                  disabled={isShared}
                >
                  No
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-6">
          {!isShared && (
            <Button
              onClick={() => setShowResult(true)}
              disabled={!isComplete}
              className="flex-1"
            >
              Show Results
            </Button>
          )}
          {showResult && isComplete && (
            <Button
              onClick={handleShare}
              className="flex-1"
              variant="outline"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Start New Survey
          </Button>
        </div>

        {showResult && isComplete && (
          <div className="space-y-4">
            <Alert className="bg-blue-50">
              <div className="flex items-center gap-2">
                {createElement(getMotivationResult(calculateScore()).icon, { className: "h-5 w-5" })}
                <AlertTitle className="text-lg m-0">
                  Score: {calculateScore()} points – {getMotivationResult(calculateScore()).type}
                </AlertTitle>
              </div>
              <AlertDescription className="mt-4">
                {getMotivationResult(calculateScore()).description}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>

      <Toaster />
    </Card>
  );
};

export default App;
