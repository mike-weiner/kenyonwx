import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';

import SkeletonCard from "../../Skeletons/Card";
import { classNames } from '../../../utils/utils';

export default function StatPack(props) {
  return (
    <div>
      <h3 className="text-base font-semibold leading-6 text-gray-900">{props.title}</h3>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {
          !props.isLoading ?
            (props.stats || []).map((item) => (
              <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
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
  );
}
