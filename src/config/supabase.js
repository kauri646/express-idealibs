import express from 'express'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env' });

const supabaseUrl = 'https://admkecqjbucsholomvpm.supabase.co'
//const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkbWtlY3FqYnVjc2hvbG9tdnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQzNTEyOTksImV4cCI6MjAxOTkyNzI5OX0.mIZrAZGD--j3nkltuEeUD9W-A8OaRML9ycUUdsfj5bE'
//const supabaseKey = process.env.SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;