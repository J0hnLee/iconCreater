export function FormGroup(props: React.ComponentPropsWithoutRef<"div">){
    return (
        <div className='flex flex-col gap-0' {...props}>{props.children}</div>

    )}
