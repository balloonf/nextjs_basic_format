"use client";
 
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
 
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
 
const FormSchema = z.object({
  text: z.string().min(2, {
    message: "text must be at least 2 characters.",
  }),
  secondText: z.string().optional(),
});
 
export default function SamplePage() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      text: "",
      secondText: "",
    },
  });
 
  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast.success(data.text);
  }
 
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl p-6 bg-muted/50 md:min-h-min">         
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
            <h2 className="text-2xl lg:text-3xl mb-6">등록화면</h2>
            
            {/* 두 개의 입력 필드를 가로로 배치하기 위한 flex 컨테이너 */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>첫번째 입력</FormLabel>
                    <FormControl>
                      <Input id="a" placeholder="wubba lubba dub dub" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="secondText"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>두번째 입력</FormLabel>
                    <FormControl>
                      <Input id="b" placeholder="두번째 필드에 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
              
            <Button type="submit" className="mt-6">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}