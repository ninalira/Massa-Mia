'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Paper, Title, TextInput, PasswordInput, Button, Text } from '@mantine/core';
import styles from './page.module.css';

const DEMO_LOGIN = 'proprietario';
const DEMO_PASSWORD = 'massa123';

export default function LoginProprietario() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    if (login.trim() !== DEMO_LOGIN || senha !== DEMO_PASSWORD) {
      setErro('Confira os dados de demonstração abaixo.');
      return;
    }

    setErro('');
    router.push('/proprietario/menu');
  }


  const campo = { label: styles.label, input: styles.input };

  return (
    <main className={styles.container}>
      <Link href="/" aria-label="Massa Mia — voltar ao início">
        <Image src="/logo.jpg" alt="Massa Mia" width={1584} height={396} priority className={styles.logo} />
      </Link>

      <Paper className={styles.card} radius={20}>
        <p className={styles.eyebrow}>GESTÃO DO RESTAURANTE</p>
        <Title order={1} className={styles.title}>
          Entrar como Proprietário
        </Title>

        <form onSubmit={handleSubmit} className={styles.form}>
          <TextInput
            label="Login"
            placeholder="Seu login"
            size="lg"
            classNames={campo}
            value={login}
            autoComplete="username"
            error={Boolean(erro)}
            onChange={(e) => {
              setLogin(e.currentTarget.value);
              setErro('');
            }}
            required
          />
          <PasswordInput
            label="Senha"
            placeholder="Sua senha"
            size="lg"
            classNames={campo}
            value={senha}
            autoComplete="current-password"
            error={Boolean(erro)}
            onChange={(e) => {
              setSenha(e.currentTarget.value);
              setErro('');
            }}
            required
          />

          {erro && (
            <div className={styles.error} role="alert">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="7" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p><strong>Login ou senha inválidos.</strong> {erro}</p>
            </div>
          )}

          <Button type="submit" fullWidth color="massaVermelho" className={`${styles.button} ${styles.buttonVermelho}`}>
            Entrar
          </Button>
        </form>

        <div className={styles.demoInfo}>
          <p className={styles.demoTitle}>Acesso de demonstração</p>
          <Text className={styles.demoText}>
            Login <strong>proprietario</strong> · Senha <strong>massa123</strong>
          </Text>
        </div>

        <Link href="/" className={styles.backLink}>Voltar ao início</Link>
      </Paper>
    </main>
  );
}
