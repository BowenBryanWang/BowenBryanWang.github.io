"use client";
import Typewriter from 'react-ts-typewriter';

interface TypewriterProps {
    text: string[];
}
const MyTypewriter = ({ text }: TypewriterProps) => {
    return (
        <h1 className="text-xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-xl">
            <Typewriter text={text} delay={5000} loop />
        </h1>
    )
}

export default MyTypewriter;
