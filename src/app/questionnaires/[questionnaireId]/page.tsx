'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Question, ParsedQuestion } from '../../interfaces/questionnaire';
import styles from './page.module.css';

function QuestionnaireComponent({ id }: { id: number }) {
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string[] | string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/questionnaires/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data: Question[] = await response.json();
        const questionIdMap = {}; // Store mapping of index to real question ID
    
        const parsedQuestions = data.map((q, index) => {
          questionIdMap[index] = q.id; // Map index to real question ID
          return {
            index, // Store index for easy access
            id: q.id,
            question: typeof q.question === 'string' ? JSON.parse(q.question) : q.question,
          };
        });
        
        setQuestions(parsedQuestions);
    
        // Fetch previous answers for the user
        const userId = 2; // Replace with actual user ID
        const previousAnswersResponse = await fetch(`/api/questionnaires/${id}/previous-answers?userId=${userId}`);
        if (previousAnswersResponse.ok) {
          const previousAnswersData = await previousAnswersResponse.json();
          console.log("Previous answers data:", previousAnswersData);
    
          const previousAnswers: { [key: number]: string[] | string } = {};
          
          Object.keys(previousAnswersData).forEach((key) => {
            const index = Number(key); // Assuming this is the index from your previous answers
            const realQuestionId = questionIdMap[index]; // Get real question ID
            const entry = previousAnswersData[key];
    
            console.log(`Mapping answer for question ID ${realQuestionId}:`, entry);
            
            if (Array.isArray(entry)) {
              previousAnswers[realQuestionId] = entry; 
            } else if (typeof entry === 'string') {
              previousAnswers[realQuestionId] = [entry];
            } else {
              console.warn(`Unexpected entry structure for key ${key}:`, entry);
            }
          });
    
          console.log("Mapped previous answers:", previousAnswers);
          setAnswers(previousAnswers);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError(`Failed to load questions: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };    

    fetchQuestions();
  }, [id]);

  const handleMCQChange = (questionId: number, option: string) => {
    setAnswers((prevAnswers) => {
      const currentAnswers = prevAnswers[questionId] || [];
      if (Array.isArray(currentAnswers)) {
        if (currentAnswers.includes(option)) {
          console.log(`Removing option '${option}' from question ID ${questionId}`);
          return {
            ...prevAnswers,
            [questionId]: currentAnswers.filter((ans) => ans !== option),
          };
        } else {
          console.log(`Adding option '${option}' to question ID ${questionId}`);
          return {
            ...prevAnswers,
            [questionId]: [...currentAnswers, option],
          };
        }
      } else {
        console.log(`Setting option '${option}' for question ID ${questionId}`);
        return {
          ...prevAnswers,
          [questionId]: [option],
        };
      }
    });
  };

  const handleInputChange = (questionId: number, value: string) => {
    console.log(`Changing input for question ID ${questionId} to '${value}'`);
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const submitAnswers = async () => {
    try {
      // Input validation: Check for empty or whitespace-only answers
      for (const questionId in answers) {
        const currentAnswers = answers[Number(questionId)];
        if (Array.isArray(currentAnswers)) {
          if (currentAnswers.some(answer => answer.trim() === '')) {
            alert("Please answer all questions before submitting."); 
            return; // Stop submission
          }
        } else if (typeof currentAnswers === 'string' && currentAnswers.trim() === '') {
          alert("Please answer all questions before submitting.");
          return;
        }
      }

      // Prepare answers with IDs in the structure required for JSONB
      const answersWithIds = Object.entries(answers)
        .filter(([questionId]) => {
          const currentAnswers = answers[Number(questionId)];
          return Array.isArray(currentAnswers) ? currentAnswers.length > 0 : currentAnswers !== '';
        })
        .map(([questionId, answer]) => ({
          question_id: Number(questionId),
          answer: Array.isArray(answer) ? answer : [answer], 
        }));

      console.log("Prepared answers for submission:", answersWithIds);

      // Make the API call to submit answers
      const response = await fetch(`/api/questionnaires/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 2, // Replace with actual user ID
          answers: answersWithIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`Submission failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Submission successful:', data);
      setSuccessMessage("Successfully submitted!");

      // Clear previous answers after successful submission
      setAnswers({});

      // Redirect to the questionnaires page after a short delay
      setTimeout(() => {
        router.push('/questionnaires'); 
      }, 2000);
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <span>Loading...</span>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.questionnaireBox}>
        <h1 className={styles.questionnaireHeader}>Questionnaire ID: {id}</h1>
        <ul className={styles.questionnaireList}>
          {questions.map((q) => (
            <li key={q.id} className={styles.questionnaireListItem}>
              <h2>
                Question {q.id} - {q.question.question ? q.question.question : 'No question text available'}
              </h2>
              {q.question.type === 'mcq' && q.question.options && (
              <div className={styles.mcqOptions}>
                {q.question.options.map((option) => (
                  <div key={option} className={styles.mcqOption}>
                    <label>
                      <input
                        type="checkbox"
                        checked={Array.isArray(answers[q.id]) && answers[q.id].includes(option)}
                        onChange={() => handleMCQChange(q.id, option)}
                      />
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              )}
              {q.question.type === 'input' && (
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    placeholder={'Enter your answer here'}
                    className={styles.inputField}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
        <button className={styles.submitButton} onClick={submitAnswers}>Submit Answers</button>
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
      </div>
    </div>
  );
}

export default function QuestionnaireDisplay() {
  const { questionnaireId } = useParams();
  const id = Array.isArray(questionnaireId) ? Number(questionnaireId[0]) : Number(questionnaireId);

  if (isNaN(id)) {
    return <div>Invalid questionnaire ID.</div>;
  }

  return <QuestionnaireComponent id={id} />;
}
