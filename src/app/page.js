'use client';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [file, setFile] = useState(false);
  const [logs, setLogs] = useState([]);
  const [levelFilter, setLevelFilter] = useState('');
  const [msgFilter, setMsgFilter] = useState('');
  const [vuFilter, setVuFilter] = useState('');
  const [iterFilter, setIterFilter] = useState('');
  const [filteredLogs, setFilteredLogs] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFile(false);
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter((line) => line.trim() !== '');
      const parsedLogs = lines
        .map((line) => {
          try {
            const obj = JSON.parse(line);

            // Format time with dynamic timezone
            let date = new Date(obj.time)
              .toISOString()
              .replace('T', ' ')
              .replace('.000Z', '');
            let msg = {};
            try {
              msg = JSON.parse(obj.msg);
            } catch (error) {
              msg.msg = obj.msg;
            }
            return {
              time: date,
              level: obj.level?.toUpperCase().replace('WARNING', 'WARN') || '',
              message: msg?.msg,
              VU: msg?.VU,
              ITER: msg?.ITER,
            };
          } catch (err) {
            console.warn('Invalid log line:', line);
            return null;
          }
        })
        .filter(Boolean);

      setLogs(parsedLogs);
      setLevelFilter('');
      setMsgFilter('');
      setVuFilter('');
      setIterFilter('');
    };

    reader.readAsText(file);

    setFile(true);
  };

  const handleFilter = () => {
    let data = logs;
    if (levelFilter || msgFilter) {
      data = logs.filter(
        (item) =>
          item.level?.includes(levelFilter) && item.message?.includes(msgFilter)
      );
    }

    if (vuFilter) {
      data = data.filter((item) => item?.VU == vuFilter);
    }
    if (iterFilter) {
      data = data.filter((item) => item?.ITER == iterFilter);
    }
    setFilteredLogs(data);
  };

  useEffect(handleFilter, [msgFilter, levelFilter, vuFilter, iterFilter, logs]);

  return (
    <>
      <div className={styles.Header}>K6 Log Viewer</div>
      <div className={styles.Controllers}>
        <input
          className={styles.File}
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
        />

        {/* Level filter */}
        <select
          className={styles.LevelFilter}
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          style={{ display: file ? 'flex' : 'none' }}
        >
          <option value="">All Levels</option>
          <option value="ERROR">ERROR</option>
          <option value="WARN">WARN</option>
          <option value="INFO">INFO</option>
          <option value="DEBUG">DEBUG</option>
        </select>

        {/* Message filter */}
        <input
          className={styles.MessageFilter}
          type="text"
          placeholder="Filter by message"
          value={msgFilter}
          onChange={(e) => setMsgFilter(e.target.value)}
          style={{ display: file ? 'flex' : 'none' }}
        />

        {/* VU filter */}
        <input
          className={styles.VUFilter}
          type="number"
          placeholder="VU"
          value={vuFilter}
          onChange={(e) => setVuFilter(e.target.value)}
          min={0}
          max={10000}
          style={{ display: file ? 'flex' : 'none' }}
        />

        {/* ITER filter */}
        <input
          className={styles.ITERFilter}
          type="number"
          placeholder="ITER"
          value={iterFilter}
          onChange={(e) => setIterFilter(e.target.value)}
          min={0}
          max={100}
          style={{ display: file ? 'flex' : 'none' }}
        />

        {/* Clear */}
        <button
          className={styles.Clear}
          style={{ display: file ? 'flex' : 'none' }}
          onClick={() => {
            setLevelFilter('');
            setMsgFilter('');
            setVuFilter('');
            setIterFilter('');
          }}
        >
          Clear
        </button>
      </div>
      <div
        className={styles.LogsHeader}
        style={{ display: file ? 'flex' : 'none' }}
      >
        <div className={styles.Row}>
          <div className={`${styles.Column} ${styles.Time}`}>TimeStamp</div>
          <div className={`${styles.Column} ${styles.Level}`}>Level</div>
          <div className={`${styles.Column} ${styles.Message}`}>Message</div>
          <div className={`${styles.Column} ${styles.VU}`}>VU</div>
          <div className={`${styles.Column} ${styles.ITER}`}>ITER</div>
        </div>
        <hr />
      </div>
      <div className={styles.Logs} style={{ display: file ? 'flex' : 'none' }}>
        {filteredLogs.map((item, index) => (
          <div className={styles.Row} key={index}>
            <div className={`${styles.Column} ${styles.Time}`}>{item.time}</div>
            <div
              className={`${styles.Column} ${styles.Level} ${
                styles[item.level]
              }`}
            >
              {item.level}
            </div>
            <div className={`${styles.Column} ${styles.Message}`}>
              {item.message}
            </div>
            <div className={`${styles.Column} ${styles.VU}`}>{item.VU}</div>
            <div className={`${styles.Column} ${styles.ITER}`}>{item.ITER}</div>
          </div>
        ))}
      </div>
      {
        filteredLogs && filteredLogs.length != logs.length &&
        <div className={styles.Count}>
          {`Showing ${filteredLogs.length} of ${logs.length} Logs`}
        </div>
      }
</>
  );
}
