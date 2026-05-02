import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CmsBlog } from './cms_blog.entity';

@Entity('cms_blog_versions')
export class CmsBlogVersion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    blogId: number;

    @ManyToOne(() => CmsBlog, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'blogId' })
    blog: CmsBlog;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'varchar', length: 255 })
    writer_name: string;

    @Column({ type: 'timestamp', nullable: true })
    published_on: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    image: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    image_alt: string;

    @Column({ type: 'varchar', length: 50, default: 'Draft' })
    status: string;

    @Column('json', { nullable: true })
    seo_content: any;

    @CreateDateColumn()
    savedAt: Date;
}