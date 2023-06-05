import { type NextPage } from "next";
import Head from "next/head";
import {Input} from "~/component/Input";
import { FormGroup } from "~/component/FormGroup";
import {Button} from "~/component/Button"
import {LogInBtn} from "~/component/login-btn"
import { useState } from "react";
import {api} from "~/utils/api"; 
import { signIn,signOut,useSession } from "next-auth/react";
import Image from "next/image";


interface GenerateIconResponse{
  base64Image:string;
}


const GeneratePage: NextPage = (props) => {

  const [form,setForm]=useState({
    prompt:"",
  })
  const [submitForm,setsubmitForm]=useState({
    prompt:"",
  })

  const [base64Image,setbase64Img]=useState("")
  // const changeHandler:React.ChangeEventHandler<HTMLInputElement>=(e)=>{
  //   setForm({...form,
  //     prompt:e.target.value})
  // }
   function updateForm(key:string){
    return function (e:React.ChangeEvent<HTMLInputElement>){
      setForm((prev)=>({...prev,[key]:e.target.value}))
    }
  }

  const generateIcon = api.generate.generateIcon.useMutation({
    onSuccess(data:GenerateIconResponse){
      console.log('mutation finish',data)
      if (!data.base64Image) return;
      setbase64Img(data.base64Image)
    }
  }
  )


  const  session = useSession()
  const isLoggedIn=!!session.data



  function handleSubmit(e:React.FormEvent){
    e.preventDefault()
    //TODO:sumit data to backend
    generateIcon.mutate({prompt:form.prompt})
    console.log(form)

  }

  return (
    <>
    <Head>
      <title>Create T3</title>
    </Head>
    <main className='flex flex-col min-h-screen  justify-center  items-center border-4 divide-x-4  w-200'>
    {!isLoggedIn && <Button onClick={() => signIn()}> 登入 </Button>}
    {isLoggedIn && <Button onClick={() => signOut()}> 登出 </Button>}
    
      <form  onSubmit={handleSubmit} className='flex flex-col gap-2'>
        <FormGroup >
          <label>prompt</label>
          {/* <Input onChange={changeHandler} /> */}
          <Input value={form.prompt} onChange={updateForm('prompt')} />
        </FormGroup>
        

        <button className='bg-blue-400 hover:bg-blue-600 px-4 py-2 rounded' >submit</button>
      </form>
      
    <Image src={`data:image/jpeg;base64, ${base64Image}`} alt='hello' width='1024' height='1024'></Image>

    </main>
    </>
  );
};

export default GeneratePage;


