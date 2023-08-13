import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/20/solid'

import SkeletonCard from "../../Skeletons/Card";
import { classNames } from '../../../utils/utils';

export default function StatPack(props) {
  return (
    <div className=" w-full rounded-2xl bg-white">
      <Disclosure defaultOpen={true}>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-100 px-4 py-2 text-left text-sm font-medium text-black-900 hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
              <span>{props.title || "title"}</span>
              <ChevronUpIcon
                className={`${open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-gray-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm">
              <div>
                <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {
                    !props.isLoading ?
                      (props.stats || []).map((item) => (
                        <div key={item.name} className="overflow-x-auto rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                          <dt className="truncate text-sm font-medium">{item.name}</dt>
                          <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                            <div className="flex items-baseline text-2xl font-semibold">
                              {item.stat || "---"}{item.unit}
                            </div>
                            {
                              item.stat && item.includeTrend ?
                                <div
                                  className={classNames(
                                    item.changeType === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                                    'inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0'
                                  )}
                                >
                                  {item.changeType === 'increase' ? (
                                    <ArrowUpIcon
                                      className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-green-500"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <ArrowDownIcon
                                      className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-red-500"
                                      aria-hidden="true"
                                    />
                                  )}

                                  <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                                  {item.change}
                                </div>
                                :
                                null
                            }
                          </dd>
                        </div>
                      ))
                      :
                      <SkeletonCard></SkeletonCard>
                  }
                </dl>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
