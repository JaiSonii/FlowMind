// This is a delete action, use to delete a task on drop using DNDkit

import { useDroppable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react"

const TrashBin = ({active = true, onDelete} : {active: boolean, onDelete: () => void})=>{
    const {setNodeRef} = useDroppable({id: 'trash-bin'})
    if(!active) return null;
    return (
        <div ref={setNodeRef} className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-red-500 hover:bg-red-600 transition-colors shadow-xl rounded-full flex items-center justify-center">
            <Trash2 className="text-white" />
        </div>
    )
}

export default TrashBin