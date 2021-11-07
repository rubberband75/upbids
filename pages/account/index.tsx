import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { getSession } from "next-auth/react"
import Layout from "../../components/layout"
import useSwr from "swr"
import React, { useState } from "react"
import axios from "axios"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AccountIndex() {
  let { data, mutate, error } = useSwr("/api/users/current", fetcher, {
    revalidateOnFocus: false,
  })

  const [state, setState] = useState({
    name: "",
    email: "",
    phone: "",
    image: "",
  })


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // console.log({ e.target.name })
    // this.props.searchUsers(this.state.text)
    // this.setState({ text: "" })
  }

  const handleChange = (e: React.FormEvent<HTMLInputElement>): void => {
    setState({ ...state, [e.currentTarget.name]: e.currentTarget.value })
  }

  const handleMutate = async (
    e: React.FormEvent<HTMLInputElement>
  ): Promise<void> => {
    let mutated = { ...data }
    mutated.user[e.currentTarget.name] = e.currentTarget.value
    console.log(mutated.user)
    let m = await mutate(mutated, false)
    console.log({ m })
  }

  return (
    <Layout>
      <h1>My Account</h1>
      <hr />
      {error && (
        // Error Message
        <>
          <div>An Error Occured!</div>
          <p>{error}</p>
        </>
      )}
      {!data && (
        // Loaing Message
        <>
          <p>Loading...</p>
        </>
      )}
      {!error && data && (
        // Account Data Form
        <>
          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Account Details</legend>
              <p>
                <label htmlFor="name">
                  <span>Full Name</span>
                </label>
                <br />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={data.user.name}
                  onChange={handleMutate}
                />
              </p>
              <p>
                <label htmlFor="email">
                  <span>Email Address</span>
                </label>
                <br />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={state.email}
                  onChange={handleChange}
                />
              </p>
              <p>
                <label htmlFor="phone">
                  <span>Phone Number</span>
                </label>
                <br />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={state.phone}
                  onChange={handleChange}
                />
              </p>
            </fieldset>
            <br />
            <button type="submit">Save</button>
          </form>
        </>
      )}
    </Layout>
  )
}
