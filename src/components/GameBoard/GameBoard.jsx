import React from 'react';
import styles from './GameBoard.module.css';

const GameBoard = ({ stage, onQuestionClick }) => { // Убрали specialQuestions из параметров
    if (!stage) return null;

    const maxQuestions = 5; // 5 вопросов в каждой категории

    // Убрали логику фильтрации специальных вопросов

    return (
        <div className={styles.gameBoard}>
            <div className={styles.snowflakes}>
                {[...Array(50)].map((_, i) => (
                    <div key={i} className={styles.snowflake}>❄</div>
                ))}
            </div>

            <div className={styles.stageHeader}>
                <h2 className={styles.stageTitle}>
                    <span className={styles.stageNumber}>Этап {stage.id}</span>
                    {stage.name}
                </h2>
                <div className={styles.stageScore}>
                    Баллы: от {stage.baseScore} до {stage.baseScore * 5}
                </div>
            </div>

            {/* Таблица вопросов */}
            <div className={styles.tableWrapper}>
                <table className={styles.gameTable}>
                    <thead>
                    <tr>
                        <th className={styles.categoryHeader}>Темы / Баллы</th>
                        {[...Array(maxQuestions)].map((_, index) => (
                            <th key={index} className={styles.scoreHeader}>
                                <div className={styles.scoreBubble}>
                                    {stage.baseScore * (index + 1)}
                                    {index === 4 && <span className={styles.maxScore}>MAX</span>}
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {stage.categories.map(category => (
                        <tr key={category.id} className={styles.categoryRow}>
                            <td className={styles.categoryCell}>
                                <span className={styles.categoryName}>{category.name}</span>
                                {category.questions.some(q => q.special === 'cat-in-bag') && (
                                    <span className={styles.specialBadge} title="Кот в мешке">🐱</span>
                                )}
                            </td>
                            {category.questions.map(question => (
                                <td key={question.id} className={styles.questionCell}>
                                    <button
                                        className={`${styles.questionButton} ${question.isAnswered ? styles.answered : ''} 
                        ${question.special ? styles[question.special] : ''}`}
                                        onClick={() => onQuestionClick(question)}
                                        disabled={question.isAnswered}
                                    >
                      <span className={styles.questionScore}>
                        {question.type === 'image' && '🖼️'}
                          {question.type === 'audio' && '🎵'}
                          {question.special === 'cat-in-bag' && '🐱'}
                          {question.special === 'double-score' && '2️⃣'}
                          {question.special === 'auction' && '⚡'}
                          {question.special === 'final' && '⭐'}
                          {question.score}
                      </span>
                                        {question.special && (
                                            <span className={styles.specialIndicator}></span>
                                        )}
                                    </button>
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Панель специальных вопросов - УБРАЛИ ЭТУ СЕКЦИЮ */}
            {/* Так как specialQuestions не передается, эту секцию нужно убрать или закомментировать */}

            <div className={styles.tableFooter}>
                <div className={styles.garland}>
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className={styles.light}></div>
                    ))}
                </div>
                <div className={styles.stageStats}>
                    <span className={styles.stat}>Тем: {stage.categories.length}</span>
                    <span className={styles.stat}>Вопросов: {stage.categories.length * 5}</span>
                    <span className={styles.stat}>Всего баллов: {stage.categories.length * 5 * stage.baseScore}</span>
                </div>
            </div>
        </div>
    );
};

export default GameBoard;