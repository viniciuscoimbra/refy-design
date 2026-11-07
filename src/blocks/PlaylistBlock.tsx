"use client";
import { useEffect, useState } from "react";
import { Badge, Button, IconButton, Slider } from "../index";
import { photos } from "./photos";
import styles from "./PlaylistBlock.module.css";

const icon = (path: string, filled = false) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={path} />
  </svg>
);
const playIcon = icon("M7 4.5v15l12-7.5z", true);
const pauseIcon = icon("M7 4h3.5v16H7zM13.5 4H17v16h-3.5z", true);
const previousIcon = icon("M18 5v14L8 12zM6 5v14");
const nextIcon = icon("M6 5v14l10-7zM18 5v14");
const shuffleIcon = icon("M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18 4l3 3-3 3M18 14l3 3-3 3");
const heartIcon = icon("M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z");
const volumeIcon = icon("M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7");

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  seconds: number;
  cover: string;
}
const tracks: PlaylistTrack[] = [
  { id: "t1", title: "Low tide", artist: "Lia Duarte", album: "Coast", seconds: 214, cover: photos.coverCoast },
  { id: "t2", title: "Open window", artist: "The Backyards", album: "Sunday", seconds: 187, cover: photos.coverSunday },
  { id: "t3", title: "City lights", artist: "Noa", album: "Neon", seconds: 242, cover: photos.coverNeon },
  { id: "t4", title: "Little by little", artist: "Lia Duarte", album: "Coast", seconds: 198, cover: photos.coverCoast },
  { id: "t5", title: "Windy afternoon", artist: "Bruno Sá", album: "Planalto", seconds: 263, cover: photos.coverPlateau },
  { id: "t6", title: "End of the workday", artist: "The Backyards", album: "Sunday", seconds: 176, cover: photos.coverSunday },
];
const clock = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
const total = tracks.reduce((sum, track) => sum + track.seconds, 0);

export function PlaylistBlock() {
  const [current, setCurrent] = useState(0),
    [playing, setPlaying] = useState(false),
    [position, setPosition] = useState(0),
    [volume, setVolume] = useState(70),
    [liked, setLiked] = useState<string[]>(["t3"]),
    [shuffle, setShuffle] = useState(false);
  const track = tracks[current];
  const go = (step: number) => {
    setCurrent((index) => (shuffle && step > 0 ? (index + 1 + Math.floor(Math.random() * (tracks.length - 1))) % tracks.length : (index + step + tracks.length) % tracks.length));
    setPosition(0);
  };
  // Local clock instead of audio: the template shows the player behaviour without shipping media files.
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setPosition((value) => {
        if (value + 1 < track.seconds) return value + 1;
        go(1);
        return 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  });
  const play = (index: number) => {
    if (index === current) setPlaying((value) => !value);
    else {
      setCurrent(index);
      setPosition(0);
      setPlaying(true);
    }
  };
  const toggleLike = (id: string) => setLiked((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]));
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <img className={styles.cover} src={photos.coverPlaylist} alt="Cover of the Friday Focus playlist" />
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Playlist</span>
          <h1>Friday Focus</h1>
          <p>Calm music to close the week without rushing.</p>
          <span className={styles.meta}>Ana Lima · {tracks.length} tracks · {Math.round(total / 60)} min</span>
          <div className={styles.heroActions}>
            <Button variant="primary" size="lg" leadingIcon={playing ? pauseIcon : playIcon} onClick={() => play(current)}>
              {playing ? "Pause" : "Play"}
            </Button>
            <IconButton aria-label={shuffle ? "Turn shuffle off" : "Turn shuffle on"} aria-pressed={shuffle} variant={shuffle ? "solid" : "outline"} size="lg" icon={shuffleIcon} onClick={() => setShuffle((value) => !value)} />
          </div>
        </div>
      </header>

      <div className={styles.tracksHead} aria-hidden="true">
        <span>#</span>
        <span />
        <span>Title</span>
        <span className={styles.album}>Album</span>
        <span className={styles.duration}>Duration</span>
      </div>
      <ol className={styles.tracks} aria-label="Tracks">
        {tracks.map((item, index) => {
          const active = index === current;
          return (
            <li key={item.id} className={active ? styles.trackActive : styles.track}>
              <button type="button" className={styles.trackMain} onClick={() => play(index)} aria-label={`${active && playing ? "Pause" : "Play"} ${item.title}, by ${item.artist}`}>
                <span className={styles.trackNumber}>{active && playing ? pauseIcon : index + 1}</span>
                <img className={styles.thumb} src={item.cover} alt="" />
                <span className={styles.trackText}>
                  <strong>{item.title}</strong>
                  <span>{item.artist}</span>
                </span>
                <span className={styles.album}>{item.album}</span>
                <span className={styles.duration}>{clock(item.seconds)}</span>
              </button>
              <IconButton aria-label={`${liked.includes(item.id) ? "Unlike" : "Like"} ${item.title}`} aria-pressed={liked.includes(item.id)} icon={liked.includes(item.id) ? icon("M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z", true) : heartIcon} onClick={() => toggleLike(item.id)} />
            </li>
          );
        })}
      </ol>

      <section className={styles.player} aria-label="Now playing">
        <div className={styles.now}>
          <img className={styles.thumb} src={track.cover} alt="" />
          <span className={styles.trackText}>
            <strong>{track.title}</strong>
            <span>{track.artist}</span>
          </span>
          {liked.includes(track.id) && <Badge tone="success">Liked</Badge>}
        </div>
        <div className={styles.controls}>
          <div className={styles.buttons}>
            <IconButton aria-label="Previous track" icon={previousIcon} onClick={() => go(-1)} />
            <IconButton aria-label={playing ? "Pause" : "Play"} variant="solid" size="lg" icon={playing ? pauseIcon : playIcon} onClick={() => setPlaying((value) => !value)} />
            <IconButton aria-label="Next track" icon={nextIcon} onClick={() => go(1)} />
          </div>
          <div className={styles.progress}>
            <span>{clock(position)}</span>
            <Slider hideLabel label="Track position" min={0} max={track.seconds} value={position} onChange={setPosition} formatValue={clock} />
            <span>{clock(track.seconds)}</span>
          </div>
        </div>
        <div className={styles.volume}>
          <span className={styles.volumeIcon}>{volumeIcon}</span>
          <Slider hideLabel label="Volume" min={0} max={100} value={volume} onChange={setVolume} formatValue={(value) => `${value}%`} />
        </div>
      </section>
    </div>
  );
}
