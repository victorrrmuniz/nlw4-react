
import { createContext, ReactNode, useEffect } from 'react'
import { useState } from 'react'
import challenges from '../../challenges.json'
import Cookies from 'js-cookie';
import { LevelUpModal } from '../components/LevelUpModal';

interface Challenge {
	type: 'body' | 'eye',
	description: string,
	amount: number
}

interface ChallangesContextData {
	level: number, 
	currentExperience: number, 
	challengesCompleted: number, 
	levelUp: () => void,
	startNewChallenge: () => void,
	activeChallenge: Challenge,
	resetChallenge: () => void,
	experienceToNextLevel: number,
	completeChallenge: () => void,
	closeLevelUpModal: () => void
}

interface ChallengesProviderProps {
	children: ReactNode,
	level: number
  currentExperience: number
  challengesCompleted: number 
}

export const ChallengesContext = createContext({} as ChallangesContextData)

export function ChallengesProvider({ children, ...rest }: ChallengesProviderProps)  {

	const [level, setLevel] = useState(rest.level ?? 1)
	const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0)
	const [challengesCompleted, setChallengesCompleted] = useState(rest.challengesCompleted ?? 0)

	const [activeChallenge, setActiveChallenge] = useState(null)
	const [isLevelUpModalUpOpen, setIsLevelUpModalOpen] = useState(false)
 
	const experienceToNextLevel = Math.pow((level + 1) * 4, 2)

	useEffect(() => {
		Notification.requestPermission()
	}, [])

  function levelUp(){
    setLevel(Number(level) + 1)
		setIsLevelUpModalOpen(true)
  }

	useEffect(() => {
		Cookies.set('level', String(level))
		Cookies.set('currentExperience', String(currentExperience))
		Cookies.set('challengesCompleted', String(challengesCompleted))
	}, [level, currentExperience, challengesCompleted])

	function closeLevelUpModal() {
		setIsLevelUpModalOpen(false)
	}

	function startNewChallenge() {
		const randomChallengeIndex = Math.floor(Math.random() * challenges.length)
	  const challenge = challenges[randomChallengeIndex]

		setActiveChallenge(challenge)

		new Audio('/notification.mp3').play()

		if(Notification.permission === 'granted'){
			new Notification('Novo desafio', {
				body: `Valendo ${challenge.amount}xp!`
			})
		}
	}

	function resetChallenge() {
		setActiveChallenge(null)
	}

	function completeChallenge() {
		if(!activeChallenge){
			return
		}

		const { amount } = activeChallenge

		let finalExperience = Number(currentExperience) + Number(amount)

		if(finalExperience >= experienceToNextLevel){
			finalExperience = finalExperience - experienceToNextLevel
			levelUp()
		}

		setCurrentExperience(finalExperience)
		setActiveChallenge(null)
		setChallengesCompleted(Number(challengesCompleted) + 1)
	}

	return (
		<ChallengesContext.Provider 
			value={{ 
				level, 
				currentExperience, 
				challengesCompleted, 
				levelUp,
				startNewChallenge,
				activeChallenge, 
				resetChallenge,
				experienceToNextLevel,
				completeChallenge,
				closeLevelUpModal
			}}>
			{children}

			{ isLevelUpModalUpOpen && <LevelUpModal /> }
		</ChallengesContext.Provider>
	)
}

