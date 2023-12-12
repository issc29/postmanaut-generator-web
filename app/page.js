'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react';
import postmanaut from '../static/postmanaut.png';
import loading from '../static/Spinner-1s-300px.gif';
import logo from '../static/logo.png';
import qr from '../static/qr.png'

export default function Home() {
  const backendAPI = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3000"
  const mockAPI = process.env.NEXT_MOCK_BACKEND_API_URL || "http://localhost:3000"
  const prodAPI = process.env.NEXT_PROD_BACKEND_API_URL || "http://localhost:3000"

  const [image, setImage] = useState(postmanaut);
  const [baseUrl, setBaseUrl] = useState(backendAPI);
  const [inputBaseUrl, setInputBaseUrl] = useState(mockAPI);
  const [prompt, setPrompt] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [apiOK, setApiOK] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageErrorText, setImageErrorText] = useState("Error fetching Image!")
  const [password, setPassword] = useState('');
  const [openAPIKey, setOpenAPIKey] = useState('');



  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch(baseUrl + '/api/status');
        const json = await data.json();
        if (json.status == "ok") {
          setApiOK(true)
        } else {
          setApiOK(false)
        }
      } catch(e){
        setApiOK(false)
      }
    }

    fetchData()
      .catch(setApiOK(false));;

  }, [baseUrl]);

  async function getImage() {
    setImageError(false)
    setButtonDisabled(true)
    var url = new URL(baseUrl + "/api/postmanaut");

    try{
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAPIKey}`
        },
        body: JSON.stringify({ prompt: prompt })
      });
      
      const data = await response.json();
      if ("error" in data) {
        if(data.error == "Unauthorized") {
          setImageErrorText("Error: OpenAI Auth Failed, set key below!")
          setImageError(true)
        }
        else {
          setImageErrorText("Error fetching Image!")
          setImageError(true)
        }
      }
      else {
        const base64 = data.data
        setImage(`data:image/jpeg;base64, ${base64}`)
      }
    }
  catch(e) {
    setButtonDisabled(false)
    setImageErrorText("Error fetching Image!")
    setImageError(true)
  }
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

  function handleSetOpenAPIKey(e) {
    setOpenAPIKey(e.target.value);
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between  bg-postman-gray text-black">

      <nav className='p-2 w-full'>
        <div className='flex-wrap flex'>
        <Link href="https://www.postman.com/" target="_blank">
          <Image
            className=""
            src={logo}
            alt="Postman Logo "
            height={75}
            priority
          />
        </Link>
        </div>
      </nav>

      <div className='py-12 flex flex-col items-center'>
        <h1 className='text-4xl sm:text-5xl'>Postmanaut Generator</h1>
        <div className='flex'>
          <span className='text-2xl mr-2'>API Status:</span>
          <span className={`text-2xl ${apiOK ? "text-green-600" : "text-red-600"}`}>{apiOK ? "API Working" : "API not working! :-("}</span>
        </div>
        <div className='relative inline h-[300px]'>

          <Image
            className="border-2 rounded-md"
            src={image}
            alt="Postmanaut"
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
          <div
            className={`absolute bottom-0 right-0 opacity-80  bg-[#f1f2f3] flex  justify-items-center items-center w-[300px] h-[300px] ${imageError ? "" : "hidden"}`}
          >
            <div className='text-center text-2xl justify-center w-full'>{imageErrorText}</div>
          </div>
        </div>

        <div className='flex flex-col items-center my-2'>
          <span className='mr-2'>Input Text:</span>
          <input type="text" id="inputPrompt" name="inputPrompt" className="rounded-md w-80 text-indigo-600 border-2 border-[#E6E6E6] bg-white" onChange={handleInputPrompt} value={prompt}></input>
        </div>


        <button className='w-32 h-12 bg-postman-orange hover:bg-postman-orange-hover rounded-md text-white disabled:bg-black mb-2'
          onClick={getImage}
          disabled={buttonDisabled}>Generate</button>

        <hr className="h-px my-8 bg-neutral-700 rounded-md border-2 w-full" />


        <div className='text-2xl mb-5 flex flex-col items-center'>
          <span className='text-2xl m-5'>Share this site!</span>

          <Image
            className="border-2 rounded-md w-48"
            src={qr}
            alt="QR Code"
            priority
          />
        </div>

        <hr className="h-px my-8 bg-neutral-700 rounded-md border-2 w-full" />
        <Link 
          href="https://www.postman.com/postman/workspace/postmanaut-generator/overview"
          className='text-xl text-postman-orange hover:text-postman-orange-hover'
          target="_blank">
            Postman Workspace
        </Link>  
        <Link 
          href="https://documenter.getpostman.com/view/21803327/2s9YkhiQQx"
          className='text-xl text-postman-orange hover:text-postman-orange-hover'
          target="_blank">
            Documentation
        </Link>         

        <hr className="h-px my-8 bg-neutral-700 rounded-md border-2 w-full" />
        <div className=''>
          <div className='flex flex-col items-center m-4'>
            <span className="text-2xl mb-2">Configuration</span>
            <div>
              <span>API URL: </span>
              <select
                className='border-2 rounded-md w-48'
                id="apiUrl"
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}>
                <option value={backendAPI}>Local</option>
                <option value={mockAPI}>Mock</option>
                <option value={prodAPI}>Production</option>
              </select>
            </div>
            <div>
              <span>OpenAI Key: </span>
              <input type="password" id="openAPIKey" name="openAPIKey" className="rounded-md w-80 text-indigo-600 border-2 border-[#E6E6E6] bg-white" onChange={handleSetOpenAPIKey} value={openAPIKey}></input>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
