import useSwr from 'swr'
import Link from 'next/link'
import axios from 'axios'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSwr('/api/users', fetcher)

  if (error) return <div>Failed to load users</div>
  if (!data) return <div>Loading...</div>

  return (
    <ul>
      {data.map((user) => (
        <li key={user._id}>
          <Link href="/admin/user/[id]" as={`/admin/user/${user._id}`}>
            <a>{`${user._id} ${user.email}`}</a>
          </Link>
        </li>
      ))}
    </ul>
  )
}
