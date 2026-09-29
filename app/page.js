'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button, Center, Stack } from '@mantine/core';
import styles from './page.module.css';

export default function Home() {
  return (
    <Center className={styles.page}>
      <Stack align="center" gap={48}>
        <Stack align="center" gap={8}>
          <Image
            src="/logo.jpg"
            alt="Massa Mia"
            width={1584}
            height={396}
            priority
            className={styles.logo}
          />
          <p className={styles.subtitle}>Sistema de gestão da pizzaria</p>
        </Stack>

        <Stack gap="md" w={360} align="stretch">
          <p className={styles.question}>Quem vai entrar?</p>

          <Button
            component={Link}
            href="/proprietario"
            color="massaVermelho"
            className={`${styles.button} ${styles.buttonVermelho}`}
            fullWidth
          >
            Proprietário
          </Button>

          <Button
            component={Link}
            href="/funcionario"
            color="massaAzul"
            className={`${styles.button} ${styles.buttonAzul}`}
            fullWidth
          >
            Funcionário
          </Button>
        </Stack>
      </Stack>
    </Center>
  );
}
