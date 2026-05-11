import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('home_about_video')
export class HomeAboutVideo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: "Let''s build your dream space." }) // Added an extra apostrophe here
title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string; // Fallback image

  @Column({ nullable: true })
  video: string; // 3D MP4 Video

  @Column({ default: true })
  show_video_desktop: boolean;

  @Column({ default: true })
  show_video_mobile: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}