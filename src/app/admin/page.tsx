'use client';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function AdminPanel() {
  const [userSummaries, setUserSummaries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userResponses, setUserResponses] = useState([]);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({});

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('/api/admin');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched admin data:', data);
        setUserSummaries(data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAdminData();
  }, []);

  const handleRowClick = async (user) => {
    if (user.completedQuestionnaires === 0) {
      return; 
    }

    setSelectedUser(user.username);
    setShowModal(true);

    // Assuming user object has an id property
    const userId = 2; // Ensure user.id exists; adjust if your data structure is different

    // Fetch questions for the user only if userId is defined
    if (userId) {
      try {
        const response = await fetch(`/api/questionnaires/1/previous-answers?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const answersData = await response.json();
        console.log('Fetched user answers:', answersData);

        // Map questions to the respective questions based on user responses
        const mappedResponses = userSummaries.find(u => u.username === user.username)?.responses || [];
        console.log('Mapped responses:', mappedResponses);
        const finalResponses = mappedResponses.map((response) => {
          const { questionnaireName, questionsAndAnswers } = response;

          return {
            questionnaireName,
            questionsAndAnswers: questionsAndAnswers.map((question) => {
              return {
                question: question.question,
                question_id: question.answer.question_id, 
              };
            }),
          };
        });

        // Set the user responses without answers
        setUserResponses(finalResponses);

        // Fetch answers for questionnaire 1
        try {
          const response = await fetch('/api/questionnaires/1/previous-answers?userId=2'); 
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const answersData = await response.json();
          console.log('Fetched questionnaire answers:', answersData);
          setQuestionnaireAnswers(answersData); 
        } catch (error) {
          console.error('Error fetching questionnaire answers:', error);
        }

      } catch (error) {
        console.error('Error fetching user answers:', error);
      }
    } else {
      console.error('User ID is undefined, cannot fetch previous answers.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Admin Panel</h1>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Username</th>
            <th className={styles.th}>Completed Questionnaires</th>
          </tr>
        </thead>
        <tbody>
          {userSummaries.map((user) => (
            <tr key={user.username} onClick={() => handleRowClick(user)}>
              <td className={styles.td}>{user.username}</td>
              <td className={styles.td}>{user.completedQuestionnaires}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleCloseModal}>
              X 
            </button> 
            <h2>{selectedUser} Responses</h2> 
            {userResponses.map((response, index) => (
              <div key={index}>
                <h3>{response.questionnaireName}</h3>
                <ul>
                  {response.questionsAndAnswers.map((qa, i) => (
                    <li key={i}>
                      <p>
                        <strong>Q: {qa.question}</strong><br />
                        {questionnaireAnswers[i] && (
                          <span>A: {questionnaireAnswers[i].join(', ')}</span>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}