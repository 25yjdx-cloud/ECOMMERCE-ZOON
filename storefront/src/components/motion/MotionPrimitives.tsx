"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type SVGMotionProps,
} from "framer-motion";
import type { ComponentProps } from "react";

type MotionContainerProps = Omit<
  HTMLMotionProps<"div">,
  "initial" | "whileInView" | "viewport" | "transition"
>;

type MotionSectionProps = Omit<
  HTMLMotionProps<"section">,
  "initial" | "whileInView" | "viewport" | "transition"
>;

export function FadeUpInView({ children, ...props }: MotionContainerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeUpSection({ children, ...props }: MotionSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export function StaggerGrid({ children, ...props }: MotionContainerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: MotionContainerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: reduceMotion ? {} : { opacity: 0, y: 22 },
        visible: reduceMotion ? {} : { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FloatingIsometricCard({ children, ...props }: MotionContainerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={reduceMotion ? undefined : { y: [-7, 7, -7], rotateZ: [-1, 1, -1] }}
      transition={
        reduceMotion
          ? undefined
          : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FloatingOrbitPill({
  children,
  delay = 0,
  ...props
}: MotionContainerProps & { delay?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={reduceMotion ? undefined : { y: [5, -5, 5] }}
      transition={
        reduceMotion
          ? undefined
          : {
              duration: 4.5,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SpringButton({
  children,
  ...props
}: HTMLMotionProps<"button">) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      whileHover={reduceMotion ? undefined : { scale: 1.03, y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

const MotionLink = motion.create(Link);

export function SpringLink({
  children,
  ...props
}: ComponentProps<typeof MotionLink>) {
  const reduceMotion = useReducedMotion();

  return (
    <MotionLink
      whileHover={reduceMotion ? undefined : { scale: 1.03, y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      {...props}
    >
      {children}
    </MotionLink>
  );
}

export function HoverLiftCard({ children, ...props }: MotionContainerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        reduceMotion ? undefined : { y: -6, transition: { duration: 0.25 } }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedPathDraw({
  d,
  ...props
}: Omit<
  SVGMotionProps<SVGPathElement>,
  "d" | "initial" | "whileInView" | "viewport" | "transition"
> & { d: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.path
      d={d}
      initial={reduceMotion ? false : { pathLength: 0 }}
      whileInView={reduceMotion ? undefined : { pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, ease: "easeInOut" }}
      {...props}
    />
  );
}

export function FloatingChatPulse({ children, ...props }: MotionContainerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
      animate={
        reduceMotion
          ? undefined
          : {
              scale: [1, 1.04, 1],
              opacity: 1,
              boxShadow: [
                "0 0 0 0 rgb(249 115 22 / 28%)",
                "0 0 0 12px rgb(249 115 22 / 0%)",
              ],
            }
      }
      transition={
        reduceMotion
          ? undefined
          : {
              scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.25 },
              boxShadow: { duration: 2.4, repeat: Infinity, ease: "easeOut" },
            }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}
