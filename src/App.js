import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard/GameBoard';
import QuestionModal from './components/QuestionModal/QuestionModal';
import ScoreBoard from './components/ScoreBoard/ScoreBoard';
import { gameStages } from './data/questions';
import styles from './App.module.css';

function App() {
  const [currentStage, setCurrentStage] = useState(0);
  const [questions, setQuestions] = useState(gameStages);
  const [teams, setTeams] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Эффект для новогодней музыки (опционально)
  useEffect(() => {
    if (gameStarted) {
      // Можно добавить фон новогоднюю музыку
      console.log('Игра началась! 🎄');
    }
  }, [gameStarted]);

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
  };

  const handleCloseModal = () => {
    setSelectedQuestion(null);
  };

  const handleAnswer = (question, teamId, isCorrect) => {
    // Обновляем вопрос как отвеченный
    const updatedQuestions = questions.map(stage => ({
      ...stage,
      categories: stage.categories.map(category => ({
        ...category,
        questions: category.questions.map(q =>
            q.id === question.id ? { ...q, isAnswered: true } : q
        )
      }))
    }));

    // Обновляем счет команды
    const updatedTeams = teams.map(team => {
      if (team.id === teamId) {
        const scoreChange = isCorrect ? question.score : -question.score;
        return { ...team, score: Math.max(0, team.score + scoreChange) };
      }
      return team;
    });

    setQuestions(updatedQuestions);
    setTeams(updatedTeams);
    setSelectedQuestion(null);
  };

  const handleScoreChange = (teamId, change) => {
    setTeams(teams.map(team =>
        team.id === teamId
            ? { ...team, score: Math.max(0, team.score + change) }
            : team
    ));
  };

  const handleTeamsChange = (newTeams) => {
    setTeams(newTeams);
  };

  const nextStage = () => {
    if (currentStage < questions.length - 1) {
      setCurrentStage(currentStage + 1);
    }
  };

  const prevStage = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1);
    }
  };

  const resetGame = () => {
    setQuestions(gameStages);
    setTeams([]);
    setCurrentStage(0);
    setGameStarted(false);
  };

  const startGame = () => {
    if (teams.length >= 2) {
      setGameStarted(true);
    } else {
      alert('Добавьте хотя бы 2 команды для начала игры!');
    }
  };

  if (!gameStarted) {
    return (
        <div className={styles.startScreen}>
          <div className={styles.fireworks}>
            {[...Array(20)].map((_, i) => (
                <div key={i} className={styles.firework}></div>
            ))}
          </div>

          <h1 className={styles.gameTitle}>
            <span className={styles.titlePart}>Своя</span>
            <span className={styles.titlePart}>Новогодняя</span>
            <span className={styles.titlePart}>Игра</span>
          </h1>

          <div className={styles.startContent}>
            <div className={styles.rules}>
              <h3 className={styles.rulesTitle}>🎁 Правила игры:</h3>
              <ul className={styles.rulesList}>
                <li>🎄 Добавьте команды участников (минимум 2)</li>
                <li>❄️ Выбирайте вопросы из таблицы</li>
                <li>⏱️ На ответ дается 30 секунд</li>
                <li>🎵 Вопросы могут содержать текст, изображения или аудио</li>
                <li>🏆 За правильный ответ - получаете очки вопроса</li>
                <li>😢 За неправильный - очки вычитаются</li>
              </ul>
            </div>

            <div className={styles.teamsSetup}>
              <h3 className={styles.setupTitle}>🎅 Создайте команды:</h3>
              <ScoreBoard
                  teams={teams}
                  onScoreChange={handleScoreChange}
                  onTeamsChange={handleTeamsChange}
              />

              <div className={styles.startActions}>
                <button
                    className={styles.startButton}
                    onClick={startGame}
                    disabled={teams.length < 2}
                >
                  🚀 Начать игру!
                </button>

                <button
                    className={styles.demoButton}
                    onClick={() => {
                      setTeams([
                        { id: 1, name: "Снеговики", score: 0, color: "#4ECDC4" },
                        { id: 2, name: "Олени", score: 0, color: "#FF6B6B" },
                        { id: 3, name: "Эльфы", score: 0, color: "#FFD166" }
                      ]);
                    }}
                >
                  🎲 Демо команды
                </button>
              </div>
            </div>
          </div>

          <div className={styles.christmasMessage}>
            С наступающим Новым Годом! 🎄✨
          </div>
        </div>
    );
  }

  return (
      <div className={styles.app}>
        <div className={styles.christmasLights}>
          {[...Array(50)].map((_, i) => (
              <div key={i} className={styles.light}></div>
          ))}
        </div>

        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>
              <span className={styles.headerIcon}>🎄</span>
              Своя Новогодняя Игра
              <span className={styles.headerIcon}>🎅</span>
            </h1>
            <div className={styles.stageInfo}>
              Этап {currentStage + 1} из {questions.length}
            </div>
          </div>

          <div className={styles.controls}>
            <button onClick={prevStage} disabled={currentStage === 0} className={styles.navButton}>
              ⏪ {questions[currentStage - 1]?.name || ''}
            </button>

            <button onClick={nextStage} disabled={currentStage === questions.length - 1} className={styles.navButton}>
              {questions[currentStage + 1]?.name || ''} ⏩
            </button>

            <button onClick={resetGame} className={styles.resetButton}>
              🆕 Новая игра
            </button>
          </div>
        </header>

        <main className={styles.main}>
          <GameBoard
              stage={questions[currentStage]}
              onQuestionClick={handleQuestionClick}
          />

          <ScoreBoard
              teams={teams}
              onScoreChange={handleScoreChange}
              onTeamsChange={handleTeamsChange}
          />
        </main>

        {selectedQuestion && (
            <QuestionModal
                question={selectedQuestion}
                onClose={handleCloseModal}
                onAnswer={handleAnswer}
                teams={teams}
            />
        )}

        <footer className={styles.footer}>
          <div className={styles.snowman}>⛄</div>
          <div className={styles.reindeer}>🦌</div>
          <div className={styles.gift}>🎁</div>
        </footer>
      </div>
  );
}

export default App;