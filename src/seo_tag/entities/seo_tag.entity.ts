import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('seo_tag')
export class SeoTag {
    @PrimaryGeneratedColumn()
    id: number;

    // The unique identifier for the frontend route (e.g., '/', '/about', '/blog/my-post')
    @Column()
    page_name: string;

    @Column({ nullable: true })
    meta_title: string;

    @Column({ type: 'text', nullable: true })
    meta_description: string;

    @Column({ nullable: true })
    canonical_url: string;

    @Column({ nullable: true })
    og_image: string;

    @Column({ nullable: true, default: 'index, follow' })
    meta_robots: string;

    @Column({ type: 'text', nullable: true })
    keywords: string;

    // JSON column to store dynamic structured data (Schema.org)
    @Column({ type: 'json', nullable: true })
    custom_schema: any;

    // --- SITEMAP CONFIGURATION ---
    @Column({ type: 'boolean', default: true })
    include_in_sitemap: boolean;

    @Column({ nullable: true, default: 'monthly' })
    sitemap_change_frequency: string;

    @Column({ nullable: true, default: '0.8' })
    sitemap_priority: string;
  
    @Column({
        type: 'enum',
        enum: ['active', 'inactive'],
        default: 'active'
    })
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}