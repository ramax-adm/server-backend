import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sensatta_accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sensatta_code' })
  sensattaCode: string;

  @Column()
  name: string;

  @Column()
  classification: string;

  @Column({ name: 'classification_type' })
  classificationType: string;

  @Column({ name: 'red_code' })
  redCode: string;

  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
