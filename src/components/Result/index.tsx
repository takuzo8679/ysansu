'use client';

import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Answer, DrillRecord, DrillResult, LevelDefinition } from '@/types';
import { formatTime } from '@/lib/formatTime';

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

interface ResultProps {
  result: DrillResult;
  levelDef: LevelDefinition;
  prevRecord?: DrillRecord | null;
}

/** 各セクション共通のフェードイン */
function FadeInRow({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      w="100%"
    >
      {children}
    </MotionBox>
  );
}

function JudgmentDisplay({ judgment }: { judgment: DrillResult['judgment'] }) {
  const config = {
    excellent: {
      label: 'ごうかく！',
      badge: '◎',
      bg: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
      badgeBg: '#FFF8DC',
      badgeColor: '#B8860B',
      labelColor: 'white',
      emoji: '🌟✨🎊',
      shadow: '0 4px 20px rgba(255, 215, 0, 0.5)',
    },
    pass: {
      label: 'ごうかく！',
      badge: '○',
      bg: 'linear-gradient(135deg, #86EFAC 0%, #4ADE80 100%)',
      badgeBg: '#F0FDF4',
      badgeColor: '#166534',
      labelColor: '#14532D',
      emoji: '🎉👏',
      shadow: '0 4px 20px rgba(74, 222, 128, 0.4)',
    },
    fail: {
      label: 'もういちど がんばろう',
      badge: '',
      bg: 'gray.100',
      badgeBg: 'transparent',
      badgeColor: 'transparent',
      labelColor: 'gray.600',
      emoji: '💪',
      shadow: 'none',
    },
  }[judgment];

  return (
    <MotionFlex
      direction="column"
      alignItems="center"
      justifyContent="center"
      bgGradient={config.bg}
      borderRadius="2xl"
      p={8}
      w="100%"
      gap={3}
      boxShadow={config.shadow}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Text fontSize="5xl" lineHeight={1}>{config.emoji}</Text>
      {config.badge && (
        <Flex
          w="64px"
          h="64px"
          borderRadius="full"
          bg={config.badgeBg}
          alignItems="center"
          justifyContent="center"
          boxShadow="md"
        >
          <Text fontSize="4xl" fontWeight="bold" color={config.badgeColor} lineHeight={1}>
            {config.badge}
          </Text>
        </Flex>
      )}
      <Text fontSize="2xl" fontWeight="extrabold" color={config.labelColor}>
        {config.label}
      </Text>
    </MotionFlex>
  );
}

function formatUserAnswer(answer: Answer): string {
  if (Array.isArray(answer.userAnswer)) {
    return answer.userAnswer.join(', ');
  }
  return String(answer.userAnswer);
}

function getCorrectDisplay(answer: Answer): string {
  const p = answer.problem;
  if (p.format === 'partial' && p.partialAnswer != null) {
    return String(p.partialAnswer);
  }
  if (p.format === 'decomposed' && p.decomposed) {
    return `${p.decomposed.upperDigits} + ${p.decomposed.lowerDigits} = ${p.correctAnswer}`;
  }
  return String(p.correctAnswer);
}

function getProblemDisplay(answer: Answer): string {
  const [left, right] = answer.problem.operands;
  if (answer.problem.format === 'partial') {
    return `${left} + ${right} ⇒`;
  }
  return `${left} + ${right} =`;
}

function WrongAnswerRow({ answer, index }: { answer: Answer; index: number }) {
  return (
    <MotionBox
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 1.2 + index * 0.15 }}
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        px={3}
        py={2}
        borderRadius="md"
        bg="orange.50"
      >
        <VStack gap={0} alignItems="flex-start">
          <Text fontSize="sm" color="gray.700">
            {getProblemDisplay(answer)}
          </Text>
          <Text fontSize="xs" color="red.400">
            きみの こたえ: {formatUserAnswer(answer)}
          </Text>
        </VStack>
        <Text fontSize="sm" fontWeight="bold" color="orange.600">
          → {getCorrectDisplay(answer)}
        </Text>
      </Flex>
    </MotionBox>
  );
}

export default function Result({ result, levelDef, prevRecord }: ResultProps) {
  const wrongAnswers = result.answers.filter((a) => !a.correct);
  const isPassed = result.judgment === 'pass' || result.judgment === 'excellent';

  // 前回より速くなったか（fail時のみ表示）
  const fasterBy =
    !isPassed && prevRecord && prevRecord.judgment === 'fail'
      ? Math.floor(prevRecord.totalTime) - Math.floor(result.totalTime)
      : null;

  return (
    <AnimatePresence>
      <VStack gap={5} w="100%" maxW="400px" mx="auto">
        {/* 判定バッジ */}
        <JudgmentDisplay judgment={result.judgment} />

        {/* 合格メッセージ or 前回比較 */}
        <FadeInRow delay={0.3}>
          {isPassed ? (
            <Text textAlign="center" fontWeight="bold" color="green.600" fontSize="md">
              おめでとう、ごうかくだよ！
            </Text>
          ) : fasterBy != null && fasterBy > 0 ? (
            <Text textAlign="center" color="blue.500" fontSize="sm">
              ⏱ まえより {fasterBy}びょう はやくなったよ！
            </Text>
          ) : null}
        </FadeInRow>

        {/* タイム・正答数（0.6s遅延でフェードイン） */}
        <FadeInRow delay={0.5}>
          <Flex
            bg="white"
            borderRadius="xl"
            boxShadow="md"
            p={4}
            w="100%"
            justifyContent="space-around"
            borderWidth="1px"
            borderColor="gray.100"
          >
            <VStack gap={1}>
              <Text fontSize="xs" color="gray.500">タイム</Text>
              <Text fontSize="xl" fontWeight="bold" color="gray.800">
                {formatTime(result.totalTime)}
              </Text>
            </VStack>
            <Box w="1px" bg="gray.200" />
            <VStack gap={1}>
              <Text fontSize="xs" color="gray.500">せいかい</Text>
              <Text fontSize="xl" fontWeight="bold" color="gray.800">
                {result.correctCount}/{result.totalCount}
              </Text>
            </VStack>
          </Flex>
        </FadeInRow>

        {/* 全問正解 or 間違い一覧（0.9s遅延でフェードイン） */}
        <FadeInRow delay={0.9}>
          {result.allCorrect ? (
            <Box
              bg="white"
              borderRadius="xl"
              boxShadow="md"
              p={6}
              w="100%"
              textAlign="center"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <Text fontSize="2xl" mb={1}>🎉</Text>
              <Text fontWeight="bold" color="green.600">
                ぜんもん せいかい！
              </Text>
            </Box>
          ) : (
            <Box
              bg="white"
              borderRadius="xl"
              boxShadow="md"
              p={4}
              w="100%"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
                まちがえた もんだい
              </Text>
              <Box maxH="250px" overflowY="auto">
                <VStack gap={2} alignItems="stretch">
                  {wrongAnswers.map((answer, i) => (
                    <WrongAnswerRow key={i} answer={answer} index={i} />
                  ))}
                </VStack>
              </Box>
            </Box>
          )}
        </FadeInRow>

        {/* タイム基準（最後にフェードイン） */}
        <FadeInRow delay={1.2 + wrongAnswers.length * 0.15}>
          <Flex fontSize="xs" color="gray.400" justifyContent="center" gap={3}>
            <Text>○タイム: {formatTime(levelDef.timeLimit.pass)}</Text>
            <Text>◎タイム: {formatTime(levelDef.timeLimit.excellent)}</Text>
          </Flex>
        </FadeInRow>
      </VStack>
    </AnimatePresence>
  );
}
