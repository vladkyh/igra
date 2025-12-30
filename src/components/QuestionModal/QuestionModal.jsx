import React, { useState, useEffect } from 'react';
import styles from './QuestionModal.module.css';

const QuestionModal = ({ question, onClose, onAnswer, teams, stage }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [timeLeft, setTimeLeft] = useState(question.special === 'auction' ? 60 : 50);
    const [timerActive, setTimerActive] = useState(true);
    const [auctionBets, setAuctionBets] = useState({});
    const [currentBid, setCurrentBid] = useState(0);

    // Для аукциона
    const [auctionStage, setAuctionStage] = useState('bidding'); // bidding, answering, result

    useEffect(() => {
        if (!timerActive || timeLeft <= 0) return;

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, timerActive]);

    useEffect(() => {
        if (timeLeft === 0) {
            setTimerActive(false);
            if (question.special === 'auction' && auctionStage === 'bidding') {
                handleAuctionEnd();
            } else if (!showAnswer) {
                setShowAnswer(true);
            }
        }
    }, [timeLeft, showAnswer, auctionStage]);

    const handleAuctionEnd = () => {
        // Находим победителя аукциона
        const winner = Object.entries(auctionBets).reduce((max, [teamId, bid]) =>
                bid > max.bid ? { teamId: parseInt(teamId), bid } : max,
            { teamId: null, bid: 0 }
        );

        if (winner.teamId) {
            setSelectedTeam(winner.teamId);
            setCurrentBid(winner.bid);
            setAuctionStage('answering');
            setTimeLeft(30);
            setTimerActive(true);
        } else {
            // Если никто не сделал ставку
            onClose();
        }
    };

    const handlePlaceBid = (teamId, bid) => {
        if (bid <= teams.find(t => t.id === teamId).score && bid > (auctionBets[teamId] || 0)) {
            setAuctionBets(prev => ({
                ...prev,
                [teamId]: bid
            }));
        }
    };

    const handleTeamSelect = (teamId) => {
        setSelectedTeam(teamId);
    };

    const handleAnswer = (correct) => {
        setTimerActive(false);
        setIsCorrect(correct);

        let finalScore = question.score;
        if (question.special === 'double-score') {
            finalScore *= 2;
        } else if (question.special === 'auction') {
            finalScore = correct ? currentBid * 2 : -currentBid;
        } else if (question.special === 'final') {
            finalScore = correct ? question.score * 2 : 0;
        }

        setTimeout(() => {
            onAnswer(question, selectedTeam, correct, finalScore);
            onClose();
        }, 1000);
    };

    const handleClose = () => {
        setShowAnswer(false);
        setSelectedTeam(null);
        setIsCorrect(null);
        setAuctionBets({});
        setCurrentBid(0);
        setAuctionStage('bidding');
        setTimeLeft(question.special === 'auction' ? 60 : 30);
        setTimerActive(true);
        onClose();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!question) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modal} ${styles[question.special]}`}>
                <div className={styles.modalHeader}>
                    <div className={styles.timer}>
                        <div className={styles.timerCircle}>
                            <span className={styles.timerText}>{formatTime(timeLeft)}</span>
                        </div>
                    </div>

                    <div className={styles.modalTitle}>
                        <h2>
                            {question.special === 'cat-in-bag' && '🐱 '}
                            {question.special === 'double-score' && '2️⃣ '}
                            {question.special === 'auction' && '⚡ '}
                            {question.special === 'final' && '⭐ '}
                            Вопрос за {question.special === 'auction' ? 'аукциона' : `${question.score} очков`}
                        </h2>
                        {question.special && (
                            <div className={styles.specialBadge}>
                                {question.special === 'cat-in-bag' && 'Кот в мешке'}
                                {question.special === 'double-score' && 'Вопрос x2'}
                                {question.special === 'auction' && 'Вопрос-аукцион'}
                                {question.special === 'final' && 'Финальный вопрос'}
                            </div>
                        )}
                    </div>

                    <button className={styles.closeButton} onClick={handleClose}>×</button>
                </div>

                <div className={styles.questionContent}>
                    {/* Специальный заголовок для аукциона */}
                    {question.special === 'auction' && auctionStage === 'bidding' && (
                        <div className={styles.auctionHeader}>
                            <h3 className={styles.auctionTitle}>🎯 АУКЦИОН ВОПРОСА!</h3>
                            <p className={styles.auctionRules}>
                                Сделайте ставку! Победитель получает право ответа.
                                При правильном ответе: ставка x2, при неправильном: -ставка
                            </p>
                        </div>
                    )}

                    <div className={styles.questionType}>
                        {question.type === 'image' && '🖼️ Вопрос с изображением'}
                        {question.type === 'audio' && '🎵 Вопрос с аудио'}
                        {question.type === 'text' && '📝 Текстовый вопрос'}
                    </div>

                    <p className={styles.questionText}>{question.text}</p>

                    {question.type === 'image' && question.media && (
                        <div className={styles.mediaContainer}>
                            <img src={question.media} alt="Вопрос" className={styles.media} />
                            <div className={styles.imageOverlay}>🎄</div>
                        </div>
                    )}

                    {question.type === 'audio' && question.media && (
                        <div className={styles.mediaContainer}>
                            <audio controls className={styles.audioPlayer}>
                                <source src={question.media} type="audio/mpeg" />
                            </audio>
                            <div className={styles.audioOverlay}>🎵</div>
                        </div>
                    )}

                    {/* Этап ставок для аукциона */}
                    {question.special === 'auction' && auctionStage === 'bidding' && (
                        <div className={styles.auctionBidding}>
                            <div className={styles.auctionTeams}>
                                {teams.map(team => (
                                    <div key={team.id} className={styles.auctionTeam}>
                                        <div
                                            className={styles.teamHeader}
                                            style={{ backgroundColor: team.color }}
                                        >
                                            <span className={styles.teamName}>{team.name}</span>
                                            <span className={styles.teamScore}>{team.score} очков</span>
                                        </div>

                                        <div className={styles.bidControls}>
                                            <div className={styles.bidButtons}>
                                                {[100, 200, 500, 1000].map(bid => (
                                                    <button
                                                        key={bid}
                                                        className={styles.bidButton}
                                                        onClick={() => handlePlaceBid(team.id, bid)}
                                                        disabled={bid > team.score || bid <= (auctionBets[team.id] || 0)}
                                                    >
                                                        +{bid}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className={styles.currentBid}>
                                                Текущая ставка: <strong>{auctionBets[team.id] || 0}</strong>
                                            </div>

                                            <div className={styles.bidInput}>
                                                <input
                                                    type="number"
                                                    placeholder="Своя ставка"
                                                    min="0"
                                                    max={team.score}
                                                    onChange={(e) => {
                                                        const bid = parseInt(e.target.value) || 0;
                                                        if (bid > (auctionBets[team.id] || 0)) {
                                                            handlePlaceBid(team.id, bid);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.auctionStatus}>
                                <h4>Текущие ставки:</h4>
                                <div className={styles.bidsList}>
                                    {Object.entries(auctionBets).map(([teamId, bid]) => {
                                        const team = teams.find(t => t.id === parseInt(teamId));
                                        return team ? (
                                            <div key={teamId} className={styles.bidItem}>
                        <span className={styles.bidTeam} style={{ color: team.color }}>
                          {team.name}:
                        </span>
                                                <span className={styles.bidAmount}>{bid} очков</span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Обычный режим или этап ответа для аукциона */}
                    {(!question.special || (question.special === 'auction' && auctionStage === 'answering')) && (
                        <>
                            {!showAnswer ? (
                                <button
                                    className={styles.showAnswerButton}
                                    onClick={() => {
                                        setShowAnswer(true);
                                        setTimerActive(false);
                                    }}
                                    disabled={timeLeft === 0}
                                >
                                    {timeLeft === 0 ? 'Время вышло!' : 'Показать ответ'}
                                </button>
                            ) : (
                                <div className={styles.answerSection}>
                                    <div className={styles.answerReveal}>
                                        <div className={styles.answerLabel}>Правильный ответ:</div>
                                        <div className={styles.answerText}>{question.answer}</div>

                                        {question.special === 'double-score' && (
                                            <div className={styles.doubleScoreInfo}>
                                                ⚡ Этот вопрос дает <strong>двойные очки</strong>!
                                            </div>
                                        )}

                                        {question.special === 'auction' && (
                                            <div className={styles.auctionResult}>
                                                <div className={styles.winnerInfo}>
                                                    🏆 Победитель аукциона:
                                                    <span style={{ color: teams.find(t => t.id === selectedTeam)?.color }}>
                            {teams.find(t => t.id === selectedTeam)?.name}
                          </span>
                                                </div>
                                                <div className={styles.bidInfo}>
                                                    Ставка: <strong>{currentBid}</strong> очков
                                                </div>
                                                <div className={styles.potentialScore}>
                                                    📈 Возможный выигрыш: <strong>{currentBid * 2}</strong> очков
                                                </div>
                                            </div>
                                        )}

                                        {question.special === 'final' && (
                                            <div className={styles.finalInfo}>
                                                ⭐ ФИНАЛЬНЫЙ ВОПРОС!
                                                <div className={styles.finalRules}>
                                                    Правильный ответ: x2 очков ({question.score * 2})
                                                    <br />
                                                    Неправильный ответ: 0 очков
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {question.special !== 'auction' && (
                                        <div className={styles.teamsSelection}>
                                            <h3>Кто отвечал?</h3>
                                            <div className={styles.teamsGrid}>
                                                {teams.map(team => (
                                                    <button
                                                        key={team.id}
                                                        className={`${styles.teamButton} ${selectedTeam === team.id ? styles.selected : ''}`}
                                                        style={{
                                                            background: team.color,
                                                            borderColor: team.id === selectedTeam ? '#FFD700' : 'transparent'
                                                        }}
                                                        onClick={() => handleTeamSelect(team.id)}
                                                    >
                                                        <span className={styles.teamName}>{team.name}</span>
                                                        <span className={styles.teamScore}>{team.score}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(selectedTeam || question.special === 'auction') && (
                                        <div className={styles.answerButtons}>
                                            <button
                                                className={`${styles.answerButton} ${styles.correct}`}
                                                onClick={() => handleAnswer(true)}
                                            >
                                                <span className={styles.buttonIcon}>✅</span>
                                                Верно!
                                                {question.special === 'double-score' && ` +${question.score * 2}`}
                                                {question.special === 'auction' && ` +${currentBid * 2}`}
                                                {question.special === 'final' && ` +${question.score * 2}`}
                                                {!question.special && ` +${question.score}`}
                                            </button>
                                            <button
                                                className={`${styles.answerButton} ${styles.incorrect}`}
                                                onClick={() => handleAnswer(false)}
                                            >
                                                <span className={styles.buttonIcon}>❌</span>
                                                Неверно!
                                                {question.special === 'auction' && ` -${currentBid}`}
                                                {!question.special && ` -${question.score}`}
                                            </button>
                                        </div>
                                    )}

                                    {isCorrect !== null && (
                                        <div className={`${styles.result} ${isCorrect ? styles.correctResult : styles.incorrectResult}`}>
                                            <div className={styles.resultIcon}>
                                                {isCorrect ? '🎉' : '😢'}
                                            </div>
                                            <div className={styles.resultText}>
                                                {isCorrect
                                                    ? `Команда "${teams.find(t => t.id === selectedTeam)?.name}" получает ${
                                                        question.special === 'double-score' ? question.score * 2 :
                                                            question.special === 'auction' ? currentBid * 2 :
                                                                question.special === 'final' ? question.score * 2 :
                                                                    question.score
                                                    } очков!`
                                                    : question.special === 'auction'
                                                        ? `Команда "${teams.find(t => t.id === selectedTeam)?.name}" теряет ${currentBid} очков`
                                                        : `Команда "${teams.find(t => t.id === selectedTeam)?.name}" теряет ${question.score} очков`
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className={styles.timeProgress}>
                    <div
                        className={styles.progressBar}
                        style={{
                            width: `${(timeLeft / (question.special === 'auction' ? 60 : 30)) * 100}%`,
                            background: timeLeft > 20 ? '#00FF00' : timeLeft > 10 ? '#FFD700' : '#FF0000'
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default QuestionModal;