'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react';
import octocat from '../static/octocat.png';
import loading from '../static/Spinner-1s-300px.gif';
import logo from '../static/logo.png';
import qr from '../static/qr.png'

export default function Home() {
  const [image, setImage] = useState(octocat);
  const [baseUrl, setBaseUrl] = useState('https://838eded7-9c7e-4fbe-b85f-73e3e7a775d4.mock.pstmn.io');
  const [inputBaseUrl, setInputBaseUrl] = useState('https://838eded7-9c7e-4fbe-b85f-73e3e7a775d4.mock.pstmn.io');
  const [prompt, setPrompt] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [apiOK, setApiOK] = useState(false)
  const [password, setPassword] = useState('');

  const backendAPI = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3000"

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetch(backendAPI + '/api/apiurl');
      const json = await data.json();
      console.log(json)
      setBaseUrl(json.url)
    }

    fetchData()
      .catch(console.error);;

  }, []);


  useEffect(() => {
    const fetchData = async () => {
      console.log("run")
      const data = await fetch(baseUrl + '/api/status');
      const json = await data.json();
      console.log(json)
      if (json.status == "ok") {
        setApiOK(true)
        console.log(apiOK)
      } else {
        setApiOK(false)
      }
      console.log(apiOK)
    }

    fetchData()
      .catch(setApiOK(false));;

  }, [baseUrl]);

  async function getImage() {
    setButtonDisabled(true)
    var url = new URL(baseUrl + "/api/octocat");
    var queryParams = { "prompt": prompt };
    for (let k in queryParams) { url.searchParams.append(k, queryParams[k]); }

    const response = await fetch(url, {
      method: 'GET',

    });
    console.log(response)
    const data = await response.json();
    console.log(data)
    console.log(data.data[0].b64_json)
    const base64 = data.data[0].b64_json
    setImage(`data:image/jpeg;base64, ${base64}`)
    setButtonDisabled(false)

  }

  async function handleSaveConfig() {
    const response = await fetch(backendAPI + '/api/apiurl', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`
      },
      body: JSON.stringify({ url: inputBaseUrl })
    });
    if (response.status >= 400 && response.status < 600) {
      console.log("Error updating API URL")
    } else {
      const data = await response.json();
      setBaseUrl(data.url)
    }

  }

  function handleInputBaseUrlChange(e) {
    setInputBaseUrl(e.target.value);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  function handleInputPrompt(e) {
    setPrompt(e.target.value);
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between  bg-postman-gray text-black">

      <nav className='p-2 w-full'>
        <div className='flex-wrap flex'>
          <Image
            className=""
            src={logo}
            alt="Postman Logo "
            height={75}
            priority
          />
        </div>
      </nav>

      <div className='py-12 flex flex-col items-center'>
        <h1 className='text-4xl sm:text-5xl'>Octocat Generator</h1>
        <div className='flex'>
          <span className='text-2xl mr-2'>API Status:</span>
          <span className={`text-2xl ${apiOK ? "text-green-600" : "text-red-600"}`}>{apiOK ? "API Working" : "API not working! :-("}</span>
        </div>
        <div className='relative inline'>

          <Image
            className="border-2 rounded-md"
            src={image}
            alt="Octocat"
            width={300}
            height={300}
            priority
          />
          <Image
            className={`absolute bottom-0 right-0 opacity-80 ${buttonDisabled ? "" : "hidden"}`}
            src={loading}
            alt="Loading"
            width={300}
            height={300}
            priority
          />
        </div>

        <div className='flex flex-col items-center my-2'>
          <span className='mr-2'>Input Text:</span>
          <input type="text" id="inputPrompt" name="inputPrompt" className="rounded-md w-80 text-indigo-600 border-2 border-[#E6E6E6] bg-white" onChange={handleInputPrompt} value={prompt}></input>
        </div>

       
        <button className='w-32 h-12 bg-postman-orange hover:bg-postman-orange-hover rounded-md text-white disabled:bg-black mb-2'
          onClick={getImage}
          disabled={buttonDisabled}>Generate</button>

<hr class="h-px my-8 bg-neutral-700 rounded-md border-2 w-full"/>


        <div className='text-2xl mb-5 flex flex-col items-center'>
          <span className='text-2xl m-5'>Share this site!</span>
          
          <Image
              className="border-2 rounded-md w-48"
              src={qr}
              alt="QR Code"
              priority
            />    
          </div>

          <hr class="h-px my-8 bg-neutral-700 rounded-md border-2 w-full"/>
        <div className=''>
          <div className='flex flex-col items-center m-4'>
            <span className="text-2xl mb-2">Configuration</span>
            <div>
              <span>API URL: </span>
              <span className=''>{baseUrl}</span>
            </div>
            <div>
              <span>API URL: </span>
              <input type="text" id="api_url" name="api_url" className="rounded-md w-80  text-indigo-600 border-2 border-[#E6E6E6] bg-white" onChange={handleInputBaseUrlChange} value={inputBaseUrl}></input>
            </div>
            <div>
              <span>Password: </span>
              <input type="password" id="password" name="password" className="rounded-md w-80  text-indigo-600 border-2 border-[#E6E6E6] bg-white" onChange={handlePasswordChange} value={password}></input>
            </div>
            <button
              className='mt-2 w-32 h-12 bg-postman-orange rounded-md hover:bg-postman-orange-hover disabled:bg-black text-white'
              onClick={handleSaveConfig}
              disabled={buttonDisabled}>Save</button>
          </div>
        </div>
      </div>
    </main>
  )
}
