import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'users' })
@Unique('UQ_EMAIL', ['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  cpf: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({
    type: 'varchar',
    name: 'refresh_token',
    nullable: true,
  })
  refreshToken: string;

  @Column({
    type: 'varchar',
    name: 'password_token',
    nullable: true,
  })
  resetPasswordToken: string;

  @Column({ type: 'varchar' })
  role: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: false,
  })
  isActive: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
