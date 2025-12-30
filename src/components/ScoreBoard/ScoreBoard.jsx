import React, { useState } from 'react';
import styles from './ScoreBoard.module.css';

const ScoreBoard = ({ teams, onScoreChange, onTeamsChange }) => {
    const [newTeamName, setNewTeamName] = useState('');
    const [editingTeam, setEditingTeam] = useState(null);

    const handleAddTeam = () => {
        if (newTeamName.trim()) {
            const newTeam = {
                id: teams.length + 1,
                name: newTeamName,
                score: 0,
                color: `#${Math.floor(Math.random()*16777215).toString(16)}`
            };
            onTeamsChange([...teams, newTeam]);
            setNewTeamName('');
        }
    };

    const handleRemoveTeam = (teamId) => {
        onTeamsChange(teams.filter(team => team.id !== teamId));
    };

    const handleUpdateTeam = (teamId, updates) => {
        onTeamsChange(teams.map(team =>
            team.id === teamId ? { ...team, ...updates } : team
        ));
        setEditingTeam(null);
    };

    const scoreButtons = [100, 200, 300, 500, -100, -200, -300, -500];

    return (
        <div className={styles.scoreBoard}>
            <div className={styles.scoreBoardHeader}>
                <h2 className={styles.title}>
                    <span className={styles.trophy}>🏆</span>
                    Таблица результатов
                    <span className={styles.trophy}>🏆</span>
                </h2>

                <div className={styles.addTeamForm}>
                    <input
                        type="text"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Название команды"
                        className={styles.teamInput}
                    />
                    <button onClick={handleAddTeam} className={styles.addButton}>
                        + Добавить команду
                    </button>
                </div>
            </div>

            <div className={styles.teamsContainer}>
                {teams.map(team => (
                    <div key={team.id} className={styles.teamCard}>
                        <div className={styles.teamHeader}>
                            {editingTeam === team.id ? (
                                <input
                                    type="text"
                                    defaultValue={team.name}
                                    onBlur={(e) => handleUpdateTeam(team.id, { name: e.target.value })}
                                    className={styles.editInput}
                                    autoFocus
                                />
                            ) : (
                                <h3
                                    className={styles.teamName}
                                    onClick={() => setEditingTeam(team.id)}
                                    style={{ color: team.color }}
                                >
                                    {team.name}
                                </h3>
                            )}
                            <button
                                className={styles.removeButton}
                                onClick={() => handleRemoveTeam(team.id)}
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.scoreDisplay}>
                            <div className={styles.scoreValue}>{team.score}</div>
                            <div className={styles.scoreLabel}>очков</div>
                        </div>

                        <div className={styles.scoreControls}>
                            <div className={styles.quickButtons}>
                                {scoreButtons.map(value => (
                                    <button
                                        key={value}
                                        className={`${styles.scoreButton} ${value > 0 ? styles.positive : styles.negative}`}
                                        onClick={() => onScoreChange(team.id, value)}
                                    >
                                        {value > 0 ? '+' : ''}{value}
                                    </button>
                                ))}
                            </div>

                            <div className={styles.customControl}>
                                <input
                                    type="number"
                                    id={`custom-score-${team.id}`}
                                    placeholder="Своё значение"
                                    className={styles.customInput}
                                />
                                <button
                                    className={styles.customButton}
                                    onClick={() => {
                                        const input = document.getElementById(`custom-score-${team.id}`);
                                        const value = parseInt(input.value) || 0;
                                        onScoreChange(team.id, value);
                                        input.value = '';
                                    }}
                                >
                                    Применить
                                </button>
                            </div>
                        </div>

                        <div className={styles.teamStats}>
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Место:</span>
                                <span className={styles.statValue}>
                  {teams
                      .sort((a, b) => b.score - a.score)
                      .findIndex(t => t.id === team.id) + 1}
                </span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Цвет:</span>
                                <input
                                    type="color"
                                    value={team.color}
                                    onChange={(e) => handleUpdateTeam(team.id, { color: e.target.value })}
                                    className={styles.colorPicker}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {teams.length === 0 && (
                <div className={styles.noTeams}>
                    <div className={styles.santa}>🎅</div>
                    <p>Добавьте команды для начала игры!</p>
                </div>
            )}
        </div>
    );
};

export default ScoreBoard;