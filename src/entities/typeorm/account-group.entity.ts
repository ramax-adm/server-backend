import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sensatta_account_groups')
export class AccountGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sensatta_code' })
  sensattaCode: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
