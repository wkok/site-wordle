import { Fragment, useMemo } from 'react'
import Table from '../Table'
import { Dialog, Transition } from '@headlessui/react'
import { XCircleIcon } from '@heroicons/react/outline'
import { useAllStatsQuery } from '../../generated/graphql'
import { notEmpty } from '../../helpers'
import prettyMilliseconds from 'pretty-ms'

type Props = {
  isOpen: boolean
  handleClose: () => void
}

export const LeaderboardModal = ({ isOpen, handleClose }: Props) => {
  const statsQuery = useAllStatsQuery(undefined, { enabled: isOpen })
  const data = useMemo(() => {
    return statsQuery.data?.allStats
      ?.filter((stat) => stat?.game?.date)
      .map((usersGame) => {
        const winDistribution = usersGame?.winDistribution || [0]
        const numberOfGames = usersGame?.totalGames || 0
        const totalGuesses = winDistribution.reduce(
          (acc, curr, idx) => acc + curr * (idx + 1),
          0
        )

        return {
          ...usersGame,
          averageGuesses: totalGuesses / numberOfGames,
        }
      })
      .filter(notEmpty)
  }, [statsQuery.data])

  const cols = useMemo(() => {
    return [
      {
        Header: 'User',
        accessor: 'username',
      },
      {
        Header: 'Current Streak',
        accessor: 'currentStreak',
      },
      {
        Header: 'Best Streak',
        accessor: 'bestStreak',
      },
      {
        Header: 'Total Games',
        accessor: 'totalGames',
      },
      {
        Header: 'Success Rate',
        accessor: 'successRate',
      },
      {
        Header: 'Games Failed',
        accessor: 'gamesFailed',
      },
      {
        Header: 'Average Guesses',
        accessor: 'averageGuesses',
      },
      {
        Header: 'Total Time Played',
        accessor: 'totalTimeTakenMillis',
        Cell: ({ cell: { value } }: any) => {
          if (typeof value !== 'number') return ''
          return prettyMilliseconds(value)
        },
      },
      {
        Header: 'Average Time Per Game',
        accessor: 'averageTimeTakenMillis',
        Cell: ({ cell: { value } }: any) => {
          if (typeof value !== 'number') return ''
          return prettyMilliseconds(value)
        },
      },
      {
        Header: 'Last Played',
        accessor: 'game.date',
      },
    ]
  }, [])
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={handleClose}
      >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className="inline-block align-bottom bg-white rounded-lg px-4 
                            pt-5 pb-4 text-left overflow-hidden shadow-xl transform 
                            transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6"
            >
              <div className="absolute right-4 top-4">
                <XCircleIcon
                  className="h-6 w-6 cursor-pointer"
                  onClick={handleClose}
                />
              </div>
              <div>
                <div className="text-center">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    Statistics
                  </Dialog.Title>
                  <div className="w-full overflow-auto">
                    {data && <Table columns={cols} data={data} />}
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
