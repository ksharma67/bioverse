'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import type { Questionnaire } from '../interfaces/questionnaire';

export default function Questionnaires() {
  const router = useRouter();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        // Fetch questionnaires without the token
        const response = await fetch('/api/questionnaires');

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data: Questionnaire[] = await response.json();
        console.log("Raw data from API:", data); // Log the raw data fetched from API
        setQuestionnaires(data); 
      } catch (error) {
        console.error('Error fetching questionnaires:', error);
        if (error instanceof Error && error.message === 'Network response was not ok') {
          setError('There was a problem connecting to the server. Please check your internet connection and try again.');
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionnaires();
  }, []); 

  const handleQuestionnaireClick = (id: number) => {
    console.log("Clicked questionnaire ID:", id); // Log clicked ID
    router.push(`/questionnaires/${id}`); 
  };

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}> 
        <h1 className={styles.loginHeader}>Select a Questionnaire</h1> 
        <ul>
          {questionnaires.map((questionnaire, index) => (
            <li
              key={questionnaire.id}
              onClick={() => handleQuestionnaireClick(questionnaire.id)} 
              className={styles.input}
            >
              {index + 1}. {questionnaire.title} 
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
