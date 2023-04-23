import { abi, contractAddresses } from "@/constants"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

const LotteryEntrance = () => {
  const { chainId: chainIdHex, isWeb3Enabled, Moralis } = useMoralis()
  const chainId = parseInt(chainIdHex)
  const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
  const [entranceFee, setEntranceFee] = useState("0")
  const [numPlayers, setNumPlayers] = useState("0")
  const [recentWinner, setRecentWinner] = useState("0")

  const dispatch = useNotification()

  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    param: {},
    msgValue: entranceFee,
  })

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    param: {},
  })

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    param: {},
  })

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    param: {},
  })

  async function updateUI() {
    const entranceFeeFromContract = (await getEntranceFee()).toString()
    const numPlayersFromContract = (await getNumberOfPlayers()).toString()
    const recentWinnerFromContract = (await getRecentWinner()).toString()
    setEntranceFee(entranceFeeFromContract)
    setNumPlayers(numPlayersFromContract)
    setRecentWinner(recentWinnerFromContract)
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      // try to read the raffle contract fee
      if (raffleAddress) {
        updateUI()
      }
    }
  }, [isWeb3Enabled])

  const handleSuccess = async (tx) => {
    await tx.wait(1)
    handleNotification(tx)
    updateUI()
  }

  const handleNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    })
  }

  const enterRaffleFunction = async () => {
    await enterRaffle({
      onSuccess: handleSuccess,
      onError: (error) => console.log(error),
    })
  }

  return (
    <>
      <div className="lg:flex lg:items-center lg:justify-between py-4 px-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Lottery Entrance
        </h2>
        <div className="min-w-0">
          {raffleAddress ? (
            <div>
              <button
                onClick={enterRaffleFunction}
                disabled={isFetching || isLoading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded py-2 px-4 ml-auto"
              >
                {isFetching || isLoading ? (
                  <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                ) : (
                  <div>Enter Raffle</div>
                )}
              </button>
            </div>
          ) : (
            <div> Please Connect to Sepolia or Goerli Network</div>
          )}
        </div>
      </div>
      {raffleAddress ? (
        <div className="py-6 px-8">
          <div className="py-4 px-4 sm:px-0">
            <h3 className="text-base font-semibold leading-7 text-gray-900">
              Lottery Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Decentralized Smart Contract Lottery.
            </p>
          </div>
          <div className="mt-6 border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Entrance Fee</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Number of Players</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {numPlayers}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Recent Winner</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {recentWinner}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <div>No Raffle address detected!</div>
      )}
    </>
  )
}
export default LotteryEntrance
