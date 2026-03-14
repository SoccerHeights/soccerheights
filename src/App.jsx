import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "./supabase.js";
import * as XLSX from "xlsx";

const BRAND = "SoccerHeights NYC";
const FIELDS = ["James J Walker","Chelsea Park","Tanahey","Robert Moses"];
const TEAM_COLORS = {
  "ar blue":"#1976D2","br purple":"#8E24AA","black":"#212121","red":"#C62828",
  "dark purple":"#7B1FA2","sky blue":"#039BE5","white":"#BDBDBD","gold":"#FF8F00",
  "yellow":"#F9A825","bdn green":"#2E7D32","orange":"#EF6C00","pink":"#E91E63",
  "gray":"#78909C","neon green":"#64DD17","green":"#4CAF50","purple":"#9C27B0",
  "br blue":"#1565C0","brendan green":"#2E7D32","bdn grn":"#2E7D32",
  "neon grn":"#64DD17","dark grn":"#2E7D32",
};
const teamColor = (name) => TEAM_COLORS[name.toLowerCase().trim()] || "#607D8B";

const loadData = async () => {
  try {
    const { data, error } = await supabase.from("league_data").select("data").eq("id", 1).single();
    if (error && error.code === "PGRST116") return { status: "empty" };
    if (error) return { status: "error", msg: error.message };
    if (!data) return { status: "empty" };
    return { status: "ok", data: data.data };
  } catch (e) { return { status: "error", msg: e.message || "Connection failed" }; }
};
const saveData = async (d) => {
  try {
    const { data: existing } = await supabase.from("league_data").select("updated_at").eq("id", 1).single();
    if (existing && existing.updated_at) {
      const dbTime = new Date(existing.updated_at).getTime();
      const now = Date.now();
      if (now - dbTime < 1000) return;
    }
    const ts = new Date().toISOString();
    await supabase.from("league_data").upsert({ id: 1, data: { ...d, _lastSave: ts }, updated_at: ts });
  } catch(e) { console.error(e); }
};

// Historical seasons data extracted from screenshots
// This file generates season objects for the app

function historicalSeasons() {
  // ===== FALL 2021 - First League Ever =====
  // Groups: 1 and 2. Champion: AR Blue (Gauchos)
  const f21T = [
    {id:"f21-er",name:"East River FC",color:"#2196F3",cap:null,group:"1"},
    {id:"f21-rd",name:"Team Red",color:"#C62828",cap:null,group:"1"},
    {id:"f21-wh",name:"Team White",color:"#BDBDBD",cap:null,group:"1"},
    {id:"f21-nc",name:"Numb Chucks FC",color:"#795548",cap:null,group:"1"},
    {id:"f21-bl",name:"AR Blue",color:"#1565C0",cap:null,group:"2"},
    {id:"f21-ml",name:"Manhattan Le Tissiers",color:"#FF5722",cap:null,group:"2"},
    {id:"f21-pu",name:"Team Purple",color:"#9C27B0",cap:null,group:"2"},
    {id:"f21-gr",name:"Team Green",color:"#4CAF50",cap:null,group:"2"},
  ];
  const f21n=n=>f21T.find(x=>x.name===n)?.id;
  const f21g=(id,h,a,d,t,hs,as,ph,v)=>({id,h:f21n(h),a:f21n(a),date:d,time:t,loc:"James J Walker",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const f21G=[
    f21g("f21-1","Numb Chucks FC","Team Red","2021-09-12","12:30 PM",4,1),f21g("f21-2","East River FC","Team White","2021-09-12","1:15 PM",7,2),
    f21g("f21-3","AR Blue","Team Purple","2021-09-19","12:30 PM",8,3),f21g("f21-4","Numb Chucks FC","East River FC","2021-09-19","1:15 PM",3,3),
    f21g("f21-5","Team Red","Team White","2021-09-26","12:30 PM",3,7),f21g("f21-6","AR Blue","Manhattan Le Tissiers","2021-09-26","1:15 PM",7,3),
    f21g("f21-7","Team Purple","Manhattan Le Tissiers","2021-10-03","11:00 AM",2,8),f21g("f21-8","Numb Chucks FC","Team White","2021-10-03","11:45 AM",1,2),f21g("f21-9","East River FC","Team Red","2021-10-03","12:30 PM",5,4),f21g("f21-10","AR Blue","Team Green","2021-10-03","1:15 PM",8,2),
    f21g("f21-11","Numb Chucks FC","Team White","2021-10-10","12:30 PM",5,9),f21g("f21-12","Manhattan Le Tissiers","Team Green","2021-10-10","1:15 PM",5,4),
    f21g("f21-13","East River FC","Team White","2021-10-17","11:00 AM",6,2),f21g("f21-14","Numb Chucks FC","Team Red","2021-10-17","11:45 AM",5,6),f21g("f21-15","Team Purple","Team Green","2021-10-17","12:30 PM",5,2),f21g("f21-16","AR Blue","Manhattan Le Tissiers","2021-10-17","1:15 PM",6,8),
    f21g("f21-17","Manhattan Le Tissiers","Team Green","2021-10-24","12:30 PM",4,1),f21g("f21-18","AR Blue","Team Purple","2021-10-24","1:15 PM",14,0),
    f21g("f21-19","Team Purple","Team Green","2021-10-31","12:30 PM",5,2),f21g("f21-20","East River FC","Team Red","2021-10-31","1:15 PM",0,2),
    f21g("f21-21","Numb Chucks FC","East River FC","2021-11-07","11:00 AM",2,1),f21g("f21-22","AR Blue","Team Green","2021-11-07","11:45 AM",8,0),f21g("f21-23","Team Red","Team White","2021-11-07","12:30 PM",10,7),f21g("f21-24","Team Purple","Manhattan Le Tissiers","2021-11-07","1:15 PM",4,4),
    f21g("f21-25","East River FC","Manhattan Le Tissiers","2021-11-14","12:30 PM",4,3),f21g("f21-26","Team Red","AR Blue","2021-11-14","1:15 PM",3,4),
    f21g("f21-f","East River FC","AR Blue","2021-11-21","12:30 PM",2,10,"playoff"),
  ];

  // ===== WINTER 2021-2022 =====
  // No groups. Champion: AR Blue
  const w21T=[
    {id:"w21-bl",name:"AR Blue",color:"#1565C0",cap:null,group:""},
    {id:"w21-wh",name:"White",color:"#BDBDBD",cap:null,group:""},
    {id:"w21-pu",name:"Purple",color:"#9C27B0",cap:null,group:""},
    {id:"w21-yl",name:"Yellow",color:"#F9A825",cap:null,group:""},
    {id:"w21-gy",name:"Gray",color:"#78909C",cap:null,group:""},
    {id:"w21-gn",name:"Bdn Green",color:"#4CAF50",cap:null,group:""},
    {id:"w21-rd",name:"Red",color:"#C62828",cap:null,group:""},
    {id:"w21-or",name:"Orange",color:"#EF6C00",cap:null,group:""},
    {id:"w21-pk",name:"Pink",color:"#E91E63",cap:null,group:""},
  ];
  const w21n=n=>w21T.find(x=>x.name===n)?.id;
  const w21g=(id,h,a,d,t,hs,as,ph,v)=>({id,h:w21n(h),a:w21n(a),date:d,time:t,loc:"James J Walker",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const w21G=[
    w21g("w21-1","White","Gray","2021-12-05","10:30 AM",2,6),w21g("w21-2","Yellow","Red","2021-12-05","11:15 AM",4,2),w21g("w21-3","Orange","AR Blue","2021-12-05","12:00 PM",1,10),w21g("w21-4","Pink","Purple","2021-12-05","12:45 PM",1,10),
    w21g("w21-5","White","Orange","2021-12-12","10:30 AM",5,3),w21g("w21-6","Gray","Pink","2021-12-12","11:15 AM",3,5),w21g("w21-7","AR Blue","Bdn Green","2021-12-12","12:00 PM",9,2),w21g("w21-8","Yellow","Purple","2021-12-12","12:45 PM",3,5),
    w21g("w21-9","Red","Orange","2022-01-09","10:30 AM",5,5),w21g("w21-10","Yellow","Bdn Green","2022-01-09","11:15 AM",3,6),w21g("w21-11","White","Purple","2022-01-09","12:00 PM",5,7),w21g("w21-12","Gray","AR Blue","2022-01-09","12:45 PM",5,7),
    w21g("w21-13","Purple","Bdn Green","2022-01-16","10:30 AM",7,4),w21g("w21-14","White","Yellow","2022-01-16","11:15 AM",5,3),w21g("w21-15","Gray","Red","2022-01-16","12:00 PM",4,6),w21g("w21-16","Pink","Orange","2022-01-16","12:45 PM",1,6),
    w21g("w21-17","Gray","Orange","2022-01-23","10:30 AM",3,2),w21g("w21-18","Red","Bdn Green","2022-01-23","11:15 AM",2,7),w21g("w21-19","Yellow","AR Blue","2022-01-23","12:00 PM",7,3),w21g("w21-20","White","Pink","2022-01-23","12:45 PM",8,2),
    w21g("w21-21","Gray","Yellow","2022-01-30","10:30 AM",2,2),w21g("w21-22","Pink","Bdn Green","2022-01-30","11:15 AM",3,6),w21g("w21-23","Purple","AR Blue","2022-01-30","12:00 PM",4,9),w21g("w21-24","White","Red","2022-01-30","12:45 PM",6,3),
    w21g("w21-25","Yellow","Pink","2022-02-06","10:30 AM",9,2),w21g("w21-26","Gray","Bdn Green","2022-02-06","11:15 AM",6,3),w21g("w21-27","Red","AR Blue","2022-02-06","12:00 PM",3,5),w21g("w21-28","Purple","Orange","2022-02-06","12:45 PM",7,4),
    w21g("w21-29","Red","Purple","2022-02-13","10:30 AM",3,0),w21g("w21-30","White","Bdn Green","2022-02-13","11:15 AM",5,5),w21g("w21-31","Yellow","Orange","2022-02-13","12:00 PM",3,1),w21g("w21-32","Pink","AR Blue","2022-02-13","12:45 PM",4,5),
    w21g("w21-33","Orange","Bdn Green","2022-02-20","10:30 AM",4,6),w21g("w21-34","Gray","Purple","2022-02-20","11:15 AM",7,4),w21g("w21-35","Red","Pink","2022-02-20","12:00 PM",8,1),w21g("w21-36","White","AR Blue","2022-02-20","12:45 PM",3,0),
    w21g("w21-q1","White","Red","2022-02-27","10:30 AM",2,5,"playoff"),w21g("w21-q2","Yellow","Gray","2022-02-27","11:15 AM",3,2,"playoff"),w21g("w21-q3","Purple","Bdn Green","2022-02-27","12:00 PM",4,5,"playoff"),w21g("w21-q4","AR Blue","Orange","2022-02-27","12:45 PM",2,1,"playoff"),
    w21g("w21-s1","Yellow","Bdn Green","2022-03-06","10:30 AM",4,1,"playoff"),w21g("w21-s2","Red","AR Blue","2022-03-06","11:15 AM",4,5,"playoff"),
    w21g("w21-f","Yellow","AR Blue","2022-03-13","10:30 AM",4,6,"playoff"),
  ];

  // ===== SPRING 2022 =====
  // No groups. Pier 40. Champion: Yellow
  const sp22T=[
    {id:"sp22-wh",name:"White",color:"#BDBDBD",cap:null,group:""},
    {id:"sp22-yl",name:"Yellow",color:"#F9A825",cap:null,group:""},
    {id:"sp22-gy",name:"Gray",color:"#78909C",cap:null,group:""},
    {id:"sp22-rd",name:"Red",color:"#C62828",cap:null,group:""},
    {id:"sp22-gn",name:"Green",color:"#4CAF50",cap:null,group:""},
    {id:"sp22-bl",name:"AR Blue",color:"#1565C0",cap:null,group:""},
  ];
  const sp22n=n=>sp22T.find(x=>x.name===n)?.id;
  const sp22g=(id,h,a,d,t,hs,as,loc,ph,v)=>({id,h:sp22n(h),a:sp22n(a),date:d,time:t,loc:loc||"Pier 40",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const sp22G=[
    sp22g("sp22-1","AR Blue","Red","2022-03-27","9:00 PM",4,5),sp22g("sp22-2","Yellow","White","2022-03-27","9:00 PM",3,2),sp22g("sp22-3","Gray","Green","2022-03-27","9:45 PM",4,1),
    sp22g("sp22-4","Gray","White","2022-04-03","9:00 PM",4,4),sp22g("sp22-5","Red","Yellow","2022-04-03","9:00 PM",2,0),sp22g("sp22-6","AR Blue","Green","2022-04-03","9:45 PM",3,4),
    sp22g("sp22-7","White","Green","2022-04-10","9:00 PM",2,2),sp22g("sp22-8","Gray","Yellow","2022-04-10","9:00 PM",2,0),sp22g("sp22-9","AR Blue","Red","2022-04-10","9:45 PM",1,2),
    sp22g("sp22-10","Red","White","2022-04-17","9:00 PM",6,7),sp22g("sp22-11","Yellow","Green","2022-04-17","9:00 PM",5,2),sp22g("sp22-12","AR Blue","Gray","2022-04-17","9:45 PM",6,2),
    sp22g("sp22-13","Yellow","Red","2022-04-24","9:00 PM",4,4),sp22g("sp22-14","Gray","Green","2022-04-24","9:00 PM",3,0),sp22g("sp22-15","AR Blue","White","2022-04-24","9:45 PM",1,9),
    sp22g("sp22-16","Red","Green","2022-05-01","9:00 PM",5,1),sp22g("sp22-17","Gray","White","2022-05-01","9:00 PM",4,6),sp22g("sp22-18","AR Blue","Yellow","2022-05-01","9:45 PM",4,7),
    sp22g("sp22-19","AR Blue","White","2022-05-08","9:00 PM",2,8),sp22g("sp22-20","Yellow","Green","2022-05-08","9:00 PM",7,1),sp22g("sp22-21","Red","Gray","2022-05-08","9:45 PM",3,3),
    sp22g("sp22-22","AR Blue","Gray","2022-05-15","9:00 PM",1,8),sp22g("sp22-23","Red","Green","2022-05-15","9:00 PM",2,3),sp22g("sp22-24","Yellow","White","2022-05-15","9:45 PM",2,2),
    sp22g("sp22-25","AR Blue","Green","2022-05-22","9:00 PM",1,3),sp22g("sp22-26","Gray","Yellow","2022-05-22","9:00 PM",2,3),sp22g("sp22-27","Red","White","2022-05-22","9:45 PM",3,4),
    sp22g("sp22-s1","White","Red","2022-06-05","9:00 PM",2,1,"Pier 40","playoff"),sp22g("sp22-s2","Yellow","Gray","2022-06-05","9:45 PM",6,4,"Pier 40","playoff"),
    sp22g("sp22-f","White","Yellow","2022-06-12","8:50 AM",0,1,"Pier 40","playoff"),
  ];

  // ===== SUMMER 2022 =====
  // No groups. Champion: AR Blue
  const su22T=[
    {id:"su22-yl",name:"Yellow",color:"#F9A825",cap:null,group:""},
    {id:"su22-gy",name:"Gray",color:"#78909C",cap:null,group:""},
    {id:"su22-or",name:"Orange",color:"#EF6C00",cap:null,group:""},
    {id:"su22-wh",name:"White",color:"#BDBDBD",cap:null,group:""},
    {id:"su22-bl",name:"AR Blue",color:"#1565C0",cap:null,group:""},
    {id:"su22-rd",name:"Red",color:"#C62828",cap:null,group:""},
    {id:"su22-gn",name:"Green",color:"#4CAF50",cap:null,group:""},
    {id:"su22-pu",name:"Purple",color:"#9C27B0",cap:null,group:""},
    {id:"su22-pk",name:"Pink",color:"#E91E63",cap:null,group:""},
  ];
  const su22n=n=>su22T.find(x=>x.name===n)?.id;
  const su22g=(id,h,a,d,t,hs,as,ph,v)=>({id,h:su22n(h),a:su22n(a),date:d,time:t,loc:"James J Walker",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const su22G=[
    su22g("su22-1","White","Orange","2022-06-25","10:30 AM",4,6),su22g("su22-2","Gray","Pink","2022-06-25","11:15 AM",6,2),su22g("su22-3","Red","Yellow","2022-06-25","12:45 PM",1,3),
    su22g("su22-4","Orange","Pink","2022-07-09","10:30 AM",4,2),su22g("su22-5","Gray","Yellow","2022-07-09","12:00 PM",3,7),
    su22g("su22-6","Red","AR Blue","2022-07-10","10:30 AM",4,2),su22g("su22-7","White","Gray","2022-07-10","11:15 AM",5,1),
    su22g("su22-8","Orange","Green","2022-07-16","11:15 AM",0,7),su22g("su22-9","White","Red","2022-07-16","12:00 PM",2,6),su22g("su22-10","Gray","AR Blue","2022-07-16","12:45 PM",3,2),
    su22g("su22-11","Yellow","Green","2022-07-17","11:15 AM",5,3),
    su22g("su22-12","White","Green","2022-07-23","10:30 AM",6,6),su22g("su22-13","Gray","Red","2022-07-23","11:15 AM",6,2),su22g("su22-14","Yellow","AR Blue","2022-07-23","12:45 PM",4,3),
    su22g("su22-15","AR Blue","Pink","2022-07-24","10:30 AM",7,1),su22g("su22-16","White","Yellow","2022-07-24","11:15 AM",4,3),
    su22g("su22-17","Yellow","Orange","2022-07-30","11:15 AM",6,6),su22g("su22-18","Red","Pink","2022-07-30","12:00 PM",4,6),
    su22g("su22-19","AR Blue","Green","2022-07-31","10:30 AM",11,7),
    su22g("su22-20","Red","Orange","2022-08-06","10:30 AM",3,8),su22g("su22-21","Gray","AR Blue","2022-08-06","11:15 AM",2,11),su22g("su22-22","White","Pink","2022-08-06","12:00 PM",7,4),
    su22g("su22-23","Orange","AR Blue","2022-08-07","10:30 AM",6,9),su22g("su22-24","Purple","Pink","2022-08-07","11:15 AM",4,0),
    su22g("su22-25","Pink","Green","2022-08-13","10:30 AM",4,7),su22g("su22-26","White","AR Blue","2022-08-13","11:15 AM",6,7),su22g("su22-27","Gray","Orange","2022-08-13","12:00 PM",5,3),
    su22g("su22-28","Red","Green","2022-08-14","10:30 AM",1,6),su22g("su22-29","Yellow","Pink","2022-08-14","11:15 AM",5,2),
    su22g("su22-30","Gray","Orange","2022-08-20","10:30 AM",5,6),su22g("su22-31","White","Red","2022-08-20","11:15 AM",6,6),su22g("su22-32","AR Blue","Green","2022-08-20","12:00 PM",8,5),su22g("su22-33","Purple","Pink","2022-08-20","12:45 PM",8,4),
    su22g("su22-34","Orange","Yellow","2022-08-21","10:30 AM",9,2),su22g("su22-35","Red","AR Blue","2022-08-21","11:15 AM",7,0),
    su22g("su22-36","Black","Purple","2022-08-20","12:45 PM",0,3),
    // QF
    su22g("su22-q1","Pink","Yellow","2022-08-20","10:30 AM",4,3,"playoff"),su22g("su22-q2","White","Green","2022-08-20","11:30 AM",8,5,"playoff"),su22g("su22-q3","Orange","Gray","2022-08-20","12:30 PM",8,5,"playoff"),su22g("su22-q4","AR Blue","Red","2022-08-21","10:30 AM",10,5,"playoff"),
    // Semi
    su22g("su22-s1","Pink","White","2022-08-27","11:30 AM",0,1,"playoff"),su22g("su22-s2","AR Blue","Orange","2022-08-28","10:45 AM",1,0,"playoff"),
    // Final
    su22g("su22-f","AR Blue","White","2022-09-10","10:30 AM",1,0,"playoff","https://app.veo.co/matches/20220910-final-blue-white4968649e/"),
  ];

  // ===== FALL 2022 =====
  // No groups. Champion: AR Blue (called Blue in sheet but = AR Blue)
  const fa22T=[
    {id:"fa22-or",name:"Orange",color:"#EF6C00",cap:null,group:""},
    {id:"fa22-bl",name:"AR Blue",color:"#1565C0",cap:null,group:""},
    {id:"fa22-wh",name:"White",color:"#BDBDBD",cap:null,group:""},
    {id:"fa22-bp",name:"BR Purple",color:"#8E24AA",cap:null,group:""},
    {id:"fa22-rd",name:"Red",color:"#C62828",cap:null,group:""},
    {id:"fa22-gy",name:"Gray",color:"#78909C",cap:null,group:""},
    {id:"fa22-gn",name:"Bdn Green",color:"#4CAF50",cap:null,group:""},
    {id:"fa22-yl",name:"Yellow",color:"#F9A825",cap:null,group:""},
    {id:"fa22-bk",name:"Black",color:"#212121",cap:null,group:""},
    {id:"fa22-pk",name:"Pink",color:"#E91E63",cap:null,group:""},
  ];
  const fa22n=n=>fa22T.find(x=>x.name===n)?.id;
  const fa22g=(id,h,a,d,t,hs,as,ph,v)=>({id,h:fa22n(h),a:fa22n(a),date:d,time:t,loc:"James J Walker",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const fa22G=[
    fa22g("fa22-1","Orange","Pink","2022-09-11","10:50 AM",10,2),fa22g("fa22-2","Gray","Bdn Green","2022-09-11","11:35 AM",5,8),fa22g("fa22-3","Black","Yellow","2022-09-11","12:20 PM",5,5),fa22g("fa22-4","Red","BR Purple","2022-09-11","1:05 PM",6,4),
    fa22g("fa22-5","White","Bdn Green","2022-09-18","10:50 AM",6,4),fa22g("fa22-6","Red","Orange","2022-09-18","11:35 AM",2,4),fa22g("fa22-7","Gray","BR Purple","2022-09-18","12:20 PM",5,5),fa22g("fa22-8","Black","AR Blue","2022-09-18","1:05 PM",1,6),
    fa22g("fa22-9","Yellow","Orange","2022-09-25","10:50 AM",4,4),fa22g("fa22-10","Black","Bdn Green","2022-09-25","11:35 AM",7,3),fa22g("fa22-11","AR Blue","Pink","2022-09-25","12:20 PM",6,5),fa22g("fa22-12","White","BR Purple","2022-09-25","1:05 PM",4,2),
    fa22g("fa22-13","Gray","Red","2022-10-02","10:50 AM",3,2),fa22g("fa22-14","Pink","Bdn Green","2022-10-02","11:35 AM",4,8),fa22g("fa22-15","Black","White","2022-10-02","12:20 PM",5,4),fa22g("fa22-16","Yellow","AR Blue","2022-10-02","1:05 PM",5,7),
    fa22g("fa22-17","BR Purple","Orange","2022-10-08","11:30 AM",3,4),fa22g("fa22-18","Black","Pink","2022-10-08","12:15 PM",3,5),
    fa22g("fa22-19","Red","Yellow","2022-10-09","10:50 AM",3,3),fa22g("fa22-20","White","Gray","2022-10-09","11:35 AM",3,4),fa22g("fa22-21","BR Purple","AR Blue","2022-10-09","12:20 PM",4,0),fa22g("fa22-22","Orange","Bdn Green","2022-10-09","1:05 PM",5,3),
    fa22g("fa22-23","BR Purple","Bdn Green","2022-10-16","10:50 AM",13,3),fa22g("fa22-24","Orange","AR Blue","2022-10-16","11:35 AM",4,3),fa22g("fa22-25","Yellow","Pink","2022-10-16","12:20 PM",3,2),fa22g("fa22-26","Black","Gray","2022-10-16","1:05 PM",4,6),
    fa22g("fa22-27","White","Pink","2022-10-23","10:50 AM",10,3),fa22g("fa22-28","Yellow","Bdn Green","2022-10-23","11:35 AM",5,9),fa22g("fa22-29","Gray","Pink","2022-10-23","12:20 PM",5,5),fa22g("fa22-30","Black","Red","2022-10-23","1:05 PM",2,8),
    fa22g("fa22-31","White","Yellow","2022-10-30","10:50 AM",7,1),fa22g("fa22-32","Red","Bdn Green","2022-10-30","11:35 AM",7,6),fa22g("fa22-33","Black","Orange","2022-10-30","12:20 PM",6,10),fa22g("fa22-34","Gray","Pink","2022-10-30","1:05 PM",5,4),
    fa22g("fa22-35","Gray","Orange","2022-11-06","10:50 AM",5,6),fa22g("fa22-36","White","Red","2022-11-06","11:35 AM",6,6),fa22g("fa22-37","AR Blue","Bdn Green","2022-11-06","12:20 PM",8,5),fa22g("fa22-38","BR Purple","Pink","2022-11-06","1:05 PM",8,4),
    fa22g("fa22-39","Yellow","BR Purple","2022-11-13","10:50 AM",2,3),fa22g("fa22-40","Orange","Red","2022-11-13","11:35 AM",9,2),fa22g("fa22-41","AR Blue","Gray","2022-11-13","12:20 PM",7,0),
    // W11 - Black 0-3 Purple (F)
    fa22g("fa22-42","Black","BR Purple","2022-11-20","10:50 AM",0,3),fa22g("fa22-43","White","Orange","2022-11-20","11:35 AM",5,2),fa22g("fa22-44","Red","AR Blue","2022-11-20","12:20 PM",3,3),
    // Semi W12
    fa22g("fa22-s1","AR Blue","White","2022-12-04","10:00 AM",4,3,"playoff"),fa22g("fa22-s2","Orange","BR Purple","2022-12-04","11:00 AM",6,3,"playoff"),
    // Final
    fa22g("fa22-f","AR Blue","Orange","2022-12-11","10:50 AM",7,1,"playoff","https://app.veo.co/matches/20221211-orange-blue-final-19abb746/"),
  ];

  // ===== WINTER 2022-2023 =====
  // No groups. Champion: Green
  const w22T=[
    {id:"w22-gn",name:"Bdn Green",color:"#4CAF50",cap:null,group:""},
    {id:"w22-pu",name:"Purple",color:"#9C27B0",cap:null,group:""},
    {id:"w22-yl",name:"Yellow",color:"#F9A825",cap:null,group:""},
    {id:"w22-bl",name:"AR Blue",color:"#1565C0",cap:null,group:""},
    {id:"w22-bk",name:"Black",color:"#212121",cap:null,group:""},
    {id:"w22-or",name:"Orange",color:"#EF6C00",cap:null,group:""},
    {id:"w22-wh",name:"White",color:"#BDBDBD",cap:null,group:""},
    {id:"w22-rd",name:"Red",color:"#C62828",cap:null,group:""},
    {id:"w22-gy",name:"Gray",color:"#78909C",cap:null,group:""},
  ];
  const w22n=n=>w22T.find(x=>x.name===n)?.id;
  const w22g=(id,h,a,d,t,hs,as,ph,v)=>({id,h:w22n(h),a:w22n(a),date:d,time:t,loc:"James J Walker",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const w22G=[
    w22g("w22-1","Bdn Green","Yellow","2022-12-03","12:05 PM",5,3),
    w22g("w22-2","Red","Gray","2022-12-04","12:05 PM",8,4),
    w22g("w22-3","White","Bdn Green","2022-12-10","10:20 AM",3,5),w22g("w22-4","Purple","Yellow","2022-12-10","11:05 AM",3,4),w22g("w22-5","Gray","Black","2022-12-10","11:50 PM",3,3),
    w22g("w22-6","Red","AR Blue","2022-12-17","10:20 AM",1,2),w22g("w22-7","White","Yellow","2022-12-17","11:05 AM",2,3),w22g("w22-8","Orange","Gray","2022-12-17","11:50 AM",3,4),w22g("w22-9","AR Blue","Bdn Green","2022-12-17","12:35 PM",5,5),
    w22g("w22-10","Orange","Bdn Green","2023-01-07","11:20 AM",6,4),w22g("w22-11","AR Blue","Black","2023-01-07","12:05 PM",6,4),
    w22g("w22-12","White","Red","2023-01-08","10:20 AM",1,1),w22g("w22-13","Purple","Gray","2023-01-08","11:05 AM",4,2),
    w22g("w22-14","Purple","Bdn Green","2023-01-15","10:20 AM",6,7),w22g("w22-15","White","Black","2023-01-15","11:05 AM",1,3),w22g("w22-16","Orange","Yellow","2023-01-15","11:50 AM",4,4),w22g("w22-17","AR Blue","Purple","2023-01-15","12:35 PM",2,6),
    w22g("w22-18","Gray","Yellow","2023-01-21","10:20 AM",1,5),w22g("w22-19","Orange","White","2023-01-21","11:05 AM",2,4),w22g("w22-20","Bdn Green","Black","2023-01-21","11:50 AM",3,3),
    w22g("w22-21","Orange","Red","2023-01-22","10:20 AM",4,4),w22g("w22-22","AR Blue","Yellow","2023-01-22","11:05 AM",2,3),w22g("w22-23","Purple","White","2023-01-22","11:50 AM",5,2),w22g("w22-24","Purple","Black","2023-01-22","12:35 PM",8,3),
    w22g("w22-25","White","Gray","2023-01-28","10:20 AM",4,0),w22g("w22-26","Bdn Green","Black","2023-01-28","11:05 AM",3,3),w22g("w22-27","Orange","AR Blue","2023-01-28","11:50 AM",3,15),
    w22g("w22-28","Red","Yellow","2023-01-29","10:20 AM",1,2),w22g("w22-29","Purple","White","2023-01-29","11:05 AM",5,2),w22g("w22-30","Orange","Black","2023-01-29","11:50 AM",6,5),
    w22g("w22-31","Purple","Red","2023-02-04","10:20 AM",7,3),w22g("w22-32","AR Blue","White","2023-02-04","11:05 AM",6,6),w22g("w22-33","Black","Yellow","2023-02-04","11:50 AM",2,1),
    w22g("w22-34","Red","Bdn Green","2023-02-05","10:20 AM",3,6),w22g("w22-35","Orange","Purple","2023-02-05","11:05 AM",1,1),
    // QF
    w22g("w22-q1","Yellow","White","2023-02-12","10:20 AM",7,1,"playoff"),w22g("w22-q2","AR Blue","Black","2023-02-12","11:50 AM",8,2,"playoff"),
    // W10
    w22g("w22-36","Bdn Green","AR Blue","2023-02-26","10:20 AM",7,6,"playoff"),w22g("w22-37","Purple","Yellow","2023-02-26","11:50 AM",4,2,"playoff"),
    // Final
    w22g("w22-f","Bdn Green","Purple","2023-03-05","11:00 AM",10,8,"playoff","https://app.veo.co/matches/20230305-final-green-purple-20cd6389/"),
  ];

  // ===== SUMMER 2023 =====
  // No groups. Champion: Green
  const su23T=[
    {id:"su23-yl",name:"Yellow",color:"#F9A825",cap:null,group:""},
    {id:"su23-pu",name:"Purple",color:"#9C27B0",cap:null,group:""},
    {id:"su23-bl",name:"AR Blue",color:"#1565C0",cap:null,group:""},
    {id:"su23-gn",name:"Bdn Green",color:"#4CAF50",cap:null,group:""},
    {id:"su23-rd",name:"Red",color:"#C62828",cap:null,group:""},
    {id:"su23-wh",name:"White",color:"#BDBDBD",cap:null,group:""},
    {id:"su23-gy",name:"Gray",color:"#78909C",cap:null,group:""},
    {id:"su23-or",name:"Orange",color:"#EF6C00",cap:null,group:""},
    {id:"su23-bk",name:"Black",color:"#212121",cap:null,group:""},
    {id:"su23-pk",name:"Pink",color:"#E91E63",cap:null,group:""},
  ];
  const su23n=n=>su23T.find(x=>x.name===n)?.id;
  const su23g=(id,h,a,d,t,hs,as,ph,v)=>({id,h:su23n(h),a:su23n(a),date:d,time:t,loc:"James J Walker",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const su23G=[
    su23g("su23-1","Red","Gray","2023-06-24","10:20 AM",2,2),su23g("su23-2","Bdn Green","Purple","2023-06-25","10:20 AM",4,4),su23g("su23-3","Yellow","White","2023-06-25","11:05 AM",5,0),su23g("su23-4","Pink","Black","2023-06-25","12:20 PM",4,9),
    su23g("su23-5","Pink","Bdn Green","2023-07-08","10:20 AM",0,3),su23g("su23-6","AR Blue","Yellow","2023-07-08","11:05 AM",3,7),
    su23g("su23-7","Pink","Gray","2023-07-09","10:20 AM",1,2),su23g("su23-8","Orange","Purple","2023-07-09","11:05 AM",2,3),su23g("su23-9","Bdn Green","White","2023-07-09","12:20 PM",3,3),su23g("su23-10","Red","Black","2023-07-09","1:05 PM",3,2),
    su23g("su23-11","Orange","Bdn Green","2023-07-15","10:20 AM",4,8),
    su23g("su23-12","White","Black","2023-07-16","10:20 AM",6,4),su23g("su23-13","Gray","Purple","2023-07-16","11:05 AM",1,5),su23g("su23-14","Yellow","Pink","2023-07-16","12:20 PM",8,3),su23g("su23-15","AR Blue","Red","2023-07-16","1:05 PM",6,3),
    su23g("su23-16","Red","Pink","2023-07-22","10:20 AM",5,4),
    su23g("su23-17","AR Blue","Bdn Green","2023-07-23","10:20 AM",6,4),su23g("su23-18","White","Purple","2023-07-23","11:05 AM",4,5),su23g("su23-19","Orange","Gray","2023-07-23","12:20 PM",5,2),su23g("su23-20","Yellow","Black","2023-07-23","1:05 PM",6,1),
    su23g("su23-21","Red","Purple","2023-07-29","10:20 AM",1,3),su23g("su23-22","Yellow","Bdn Green","2023-07-29","11:05 AM",7,1),su23g("su23-23","AR Blue","Gray","2023-07-29","12:20 PM",6,3),su23g("su23-24","Orange","White","2023-07-29","1:05 PM",5,3),
    su23g("su23-25","Orange","Black","2023-08-05","10:20 AM",4,7),
    su23g("su23-26","Yellow","Purple","2023-08-06","10:20 AM",7,1),su23g("su23-27","Gray","White","2023-08-06","11:05 AM",3,1),su23g("su23-28","AR Blue","Red","2023-08-06","12:20 PM",7,2),su23g("su23-29","Orange","Pink","2023-08-06","1:05 PM",9,2),
    su23g("su23-30","Pink","White","2023-08-12","10:20 AM",2,3),su23g("su23-31","Orange","Red","2023-08-12","11:05 AM",4,6),su23g("su23-32","Bdn Green","Black","2023-08-12","12:20 PM",5,6),su23g("su23-33","AR Blue","Purple","2023-08-12","1:05 PM",3,5),
    su23g("su23-34","Orange","AR Blue","2023-08-19","10:20 AM",0,3),su23g("su23-35","Purple","Black","2023-08-19","11:05 AM",6,2),
    su23g("su23-36","Yellow","Pink","2023-08-20","10:20 AM",1,6),su23g("su23-37","Red","White","2023-08-20","11:05 AM",3,5),su23g("su23-38","AR Blue","Black","2023-08-20","12:20 PM",11,8),su23g("su23-39","Bdn Green","Gray","2023-08-20","1:05 PM",7,4),
    su23g("su23-40","Pink","Purple","2023-08-26","10:20 AM",1,10),
    su23g("su23-41","Gray","Black","2023-08-27","10:20 AM",3,0),su23g("su23-42","Orange","Yellow","2023-08-27","11:05 AM",2,11),su23g("su23-43","Red","Bdn Green","2023-08-27","12:20 PM",2,8),su23g("su23-44","AR Blue","White","2023-08-27","1:05 PM",8,4),
    // Semi
    su23g("su23-s1","Purple","AR Blue","2023-09-09","8:50 AM",6,4,"playoff"),su23g("su23-s2","Yellow","Bdn Green","2023-09-09","9:50 AM",4,6,"playoff"),
    // Final
    su23g("su23-f","Purple","Bdn Green","2023-09-16","9:30 AM",4,5,"playoff","https://app.veo.co/matches/20230916-purple-green-final-9f9c75d2/"),
  ];

  // ===== FALL 2023 =====
  // Groups A and B. Champion: BR Purple (Purple beats Green)
  // Note: Dark Green = Bdn Green
  const fa23T=[
    {id:"fa23-bl",name:"AR Blue",color:"#1565C0",cap:null,group:"A"},
    {id:"fa23-gd",name:"Gold",color:"#FF8F00",cap:null,group:"A"},
    {id:"fa23-gy",name:"Gray",color:"#78909C",cap:null,group:"A"},
    {id:"fa23-gn",name:"Bdn Green",color:"#4CAF50",cap:null,group:"A"},
    {id:"fa23-rd",name:"Red",color:"#C62828",cap:null,group:"A"},
    {id:"fa23-bk",name:"Black",color:"#212121",cap:null,group:"A"},
    {id:"fa23-or",name:"Orange",color:"#EF6C00",cap:null,group:"B"},
    {id:"fa23-bp",name:"BR Purple",color:"#8E24AA",cap:null,group:"B"},
    {id:"fa23-yl",name:"Yellow",color:"#F9A825",cap:null,group:"B"},
    {id:"fa23-bg",name:"Bdn Green",color:"#2E7D32",cap:null,group:"B"},
    {id:"fa23-wh",name:"White",color:"#BDBDBD",cap:null,group:"B"},
    {id:"fa23-pk",name:"Pink",color:"#E91E63",cap:null,group:"B"},
  ];
  const fa23n=n=>fa23T.find(x=>x.name===n)?.id;
  const fa23g=(id,h,a,d,t,hs,as,ph,v)=>({id,h:fa23n(h),a:fa23n(a),date:d,time:t,loc:"James J Walker",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const fa23G=[
    fa23g("fa23-1","Red","Black","2023-09-10","10:50 AM",2,4),fa23g("fa23-2","Pink","White","2023-09-10","11:35 AM",3,6),fa23g("fa23-3","Gray","Gold","2023-09-10","12:20 PM",5,5),fa23g("fa23-4","Bdn Green","Orange","2023-09-10","1:05 PM",3,4),
    fa23g("fa23-5","Red","Gray","2023-09-17","10:50 AM",6,3),fa23g("fa23-6","Orange","Yellow","2023-09-17","11:35 AM",3,2),fa23g("fa23-7","Pink","Bdn Green","2023-09-17","12:20 PM",3,0),fa23g("fa23-8","Gold","AR Blue","2023-09-17","1:05 PM",4,8),
    fa23g("fa23-9","Black","Bdn Green","2023-09-24","10:50 AM",1,5),fa23g("fa23-10","White","BR Purple","2023-09-24","11:35 AM",5,4),fa23g("fa23-11","Red","AR Blue","2023-09-24","12:20 PM",6,7),fa23g("fa23-12","Pink","Yellow","2023-09-24","1:05 PM",1,12),
    fa23g("fa23-13","White","Yellow","2023-10-01","10:50 AM",3,9),fa23g("fa23-14","Black","AR Blue","2023-10-01","11:35 AM",2,7),fa23g("fa23-15","Bdn Green","BR Purple","2023-10-01","12:20 PM",2,4),fa23g("fa23-16","Gray","Bdn Green","2023-10-01","1:05 PM",5,4),
    fa23g("fa23-17","White","Bdn Green","2023-10-07","11:20 AM",3,7),fa23g("fa23-18","Red","Gold","2023-10-07","12:05 PM",6,2),
    fa23g("fa23-19","AR Blue","Bdn Green","2023-10-08","10:50 AM",2,7),fa23g("fa23-20","Pink","BR Purple","2023-10-08","11:35 AM",0,7),fa23g("fa23-21","Black","Gray","2023-10-08","12:20 PM",0,3),fa23g("fa23-22","Yellow","BR Purple","2023-10-08","1:05 PM",2,5),
    fa23g("fa23-23","Red","Bdn Green","2023-10-15","10:50 AM",0,5),fa23g("fa23-24","Pink","BR Purple","2023-10-15","11:35 AM",0,7),fa23g("fa23-25","Black","Gold","2023-10-15","12:20 PM",2,4),fa23g("fa23-26","White","Orange","2023-10-15","1:05 PM",3,4),
    fa23g("fa23-27","Gray","AR Blue","2023-10-22","10:50 AM",4,7),fa23g("fa23-28","Bdn Green","Yellow","2023-10-22","11:35 AM",2,5),fa23g("fa23-29","Gold","Bdn Green","2023-10-22","12:20 PM",7,3),fa23g("fa23-30","Orange","BR Purple","2023-10-22","1:05 PM",5,5),
    fa23g("fa23-31","Red","Bdn Green","2023-10-29","10:50 AM",3,5),fa23g("fa23-32","AR Blue","Orange","2023-10-29","11:35 AM",2,7),fa23g("fa23-33","Gold","White","2023-10-29","12:20 PM",5,1),fa23g("fa23-34","Gray","Yellow","2023-10-29","1:05 PM",2,8),
    fa23g("fa23-35","Red","BR Purple","2023-11-05","10:50 AM",2,9),fa23g("fa23-36","Black","Orange","2023-11-05","11:35 AM",3,5),fa23g("fa23-37","Gold","Yellow","2023-11-05","12:20 PM",1,4),fa23g("fa23-38","Bdn Green","Bdn Green","2023-11-05","1:05 PM",2,3),
    fa23g("fa23-39","Black","Orange","2023-11-12","10:50 AM",3,5),fa23g("fa23-40","BR Purple","Bdn Green","2023-11-12","11:35 AM",4,3),fa23g("fa23-41","AR Blue","Pink","2023-11-12","12:20 PM",4,4),fa23g("fa23-42","Gray","White","2023-11-12","1:05 PM",7,1),
    // QF W11
    fa23g("fa23-q1","Bdn Green","Orange","2023-11-19","10:50 AM",6,5,"playoff"),fa23g("fa23-q2","BR Purple","Gray","2023-11-19","11:35 AM",2,0,"playoff"),fa23g("fa23-q3","Gold","Yellow","2023-11-19","12:20 PM",5,4,"playoff"),fa23g("fa23-q4","AR Blue","Bdn Green","2023-11-19","1:05 PM",4,2,"playoff"),
    // Semi
    fa23g("fa23-s1","BR Purple","AR Blue","2023-12-03","10:05 AM",0,0,"playoff"),fa23g("fa23-s2","Bdn Green","Gold","2023-12-03","11:05 AM",0,0,"playoff"),
    // Final - Green 5-8 Purple => BR Purple wins
    fa23g("fa23-f","Bdn Green","BR Purple","2023-12-10","11:05 AM",5,8,"playoff","https://app.veo.co/matches/20231210-green-purple-final-fall-2023-a0c7622a/"),
  ];

  // ===== WINTER 2023-2024 =====
  // Groups A and B. Champion: BR Purple (beats Blue in final)
  // Dark Green = Bdn Green
  const w23T=[
    {id:"w23-bp",name:"BR Purple",color:"#8E24AA",cap:null,group:"A"},
    {id:"w23-gn",name:"Bdn Green",color:"#4CAF50",cap:null,group:"A"},
    {id:"w23-rd",name:"Red",color:"#C62828",cap:null,group:"A"},
    {id:"w23-bk",name:"Black",color:"#212121",cap:null,group:"A"},
    {id:"w23-gy",name:"Gray",color:"#78909C",cap:null,group:"A"},
    {id:"w23-yl",name:"Yellow",color:"#F9A825",cap:null,group:"A"},
    {id:"w23-bl",name:"AR Blue",color:"#1565C0",cap:null,group:"B"},
    {id:"w23-gd",name:"Gold",color:"#FF8F00",cap:null,group:"B"},
    {id:"w23-pk",name:"Pink",color:"#E91E63",cap:null,group:"B"},
    {id:"w23-bg",name:"Bdn Green",color:"#2E7D32",cap:null,group:"B"},
    {id:"w23-wh",name:"White",color:"#BDBDBD",cap:null,group:"B"},
    {id:"w23-or",name:"Orange",color:"#EF6C00",cap:null,group:"B"},
  ];
  const w23n=n=>w23T.find(x=>x.name===n)?.id;
  const w23g=(id,h,a,d,t,hs,as,ph,v)=>({id,h:w23n(h),a:w23n(a),date:d,time:t,loc:"James J Walker",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const w23G=[
    w23g("w23-1","Red","Black","2023-12-02","10:20 AM",4,3),w23g("w23-2","Pink","White","2023-12-02","11:05 AM",2,8),w23g("w23-3","Gray","Yellow","2023-12-02","11:50 AM",1,5),
    w23g("w23-4","White","Orange","2023-12-03","10:45 AM",4,3),w23g("w23-5","AR Blue","Gold","2023-12-03","10:45 AM",4,0),
    w23g("w23-6","Red","Gray","2023-12-09","10:20 AM",3,1),w23g("w23-7","Black","Yellow","2023-12-09","11:05 AM",3,0),
    w23g("w23-8","Bdn Green","Orange","2023-12-16","10:20 AM",3,0),w23g("w23-9","Pink","AR Blue","2023-12-16","11:05 AM",4,7),
    w23g("w23-10","Black","BR Purple","2023-12-17","10:20 AM",1,3),w23g("w23-11","Red","Bdn Green","2023-12-17","11:05 AM",2,4),
    w23g("w23-12","White","AR Blue","2023-01-06","10:20 AM",4,5),w23g("w23-13","Black","Bdn Green","2023-01-06","11:05 AM",2,5),w23g("w23-14","Bdn Green","Gold","2023-01-06","11:50 AM",4,11),
    w23g("w23-15","Gray","BR Purple","2023-01-07","10:20 AM",4,3),w23g("w23-16","Red","Yellow","2023-01-07","11:05 AM",4,2),w23g("w23-17","Pink","Orange","2023-01-07","11:50 AM",4,2),w23g("w23-18","Orange","AR Blue","2023-01-07","12:35 PM",3,0),
    w23g("w23-19","Pink","Gold","2024-01-13","10:20 AM",7,6),w23g("w23-20","Bdn Green","BR Purple","2024-01-13","11:05 AM",3,6),w23g("w23-21","White","Bdn Green","2024-01-13","11:50 AM",1,1),
    w23g("w23-22","Gray","Red","2024-01-14","10:20 AM",3,2),w23g("w23-23","Black","Yellow","2024-01-14","11:05 AM",3,2),
    w23g("w23-24","White","Gold","2024-01-21","10:20 AM",0,9),w23g("w23-25","Orange","Bdn Green","2024-01-21","11:05 AM",2,5),w23g("w23-26","Yellow","BR Purple","2024-01-21","11:50 AM",2,4),
    w23g("w23-27","Red","BR Purple","2024-01-28","10:20 AM",3,2),w23g("w23-28","Gray","Bdn Green","2024-01-28","11:05 AM",3,8),
    w23g("w23-29","Pink","Bdn Green","2024-01-28","11:50 AM",4,6),w23g("w23-30","AR Blue","Orange","2024-01-28","12:35 PM",0,8),
    w23g("w23-31","Bdn Green","Black","2024-02-03","10:20 AM",6,5),w23g("w23-32","Red","AR Blue","2024-02-03","11:05 AM",0,6),w23g("w23-33","BR Purple","White","2024-02-03","11:50 AM",8,1),
    w23g("w23-34","Yellow","Pink","2024-02-04","10:20 AM",3,7),w23g("w23-35","Black","Bdn Green","2024-02-04","11:05 AM",4,4),w23g("w23-36","Gray","Orange","2024-02-04","11:50 AM",4,3),w23g("w23-37","Red","Gold","2024-02-04","12:35 PM",6,7),
    w23g("w23-38","Yellow","Bdn Green","2024-02-10","10:20 AM",3,3),w23g("w23-39","Black","Gray","2024-02-10","11:05 AM",3,2),
    w23g("w23-40","BR Purple","Bdn Green","2024-02-11","10:20 AM",4,3),w23g("w23-41","Gray","Gold","2024-02-11","11:05 AM",3,6),w23g("w23-42","Black","White","2024-02-11","11:50 AM",3,1),
    // QF
    w23g("w23-q1","BR Purple","Bdn Green","2024-02-24","10:20 AM",8,1,"playoff"),w23g("w23-q2","Bdn Green","Pink","2024-02-24","11:20 AM",12,6,"playoff"),
    w23g("w23-q3","Red","Gold","2024-02-25","10:20 AM",5,10,"playoff"),w23g("w23-q4","Black","AR Blue","2024-02-25","11:20 AM",2,8,"playoff"),
    // Semi
    w23g("w23-s1","BR Purple","Gold","2024-03-03","10:20 AM",8,6,"playoff"),w23g("w23-s2","Bdn Green","AR Blue","2024-03-03","11:00 AM",2,6,"playoff"),
    // Final
    w23g("w23-f","BR Purple","AR Blue","2024-03-10","10:20 AM",1,0,"playoff","https://app.veo.co/matches/20240310-final-purple-blue-in-green-aba49681/"),
  ];

  // ===== SPRING 2024 =====
  // Single group, 9 teams. Champion: BR Purple
  const sp24T=[
    {id:"sp24-gd",name:"Gold",color:"#FF8F00",cap:null,group:""},
    {id:"sp24-wh",name:"White",color:"#BDBDBD",cap:null,group:""},
    {id:"sp24-rd",name:"Red",color:"#C62828",cap:null,group:""},
    {id:"sp24-bp",name:"BR Purple",color:"#8E24AA",cap:null,group:""},
    {id:"sp24-yl",name:"Yellow",color:"#F9A825",cap:null,group:""},
    {id:"sp24-gy",name:"Gray",color:"#78909C",cap:null,group:""},
    {id:"sp24-bl",name:"AR Blue",color:"#1565C0",cap:null,group:""},
    {id:"sp24-bk",name:"Black",color:"#212121",cap:null,group:""},
    {id:"sp24-gn",name:"Bdn Green",color:"#4CAF50",cap:null,group:""},
  ];
  const sp24n=n=>sp24T.find(x=>x.name===n)?.id;
  const sp24g=(id,h,a,d,t,hs,as,loc,ph,v)=>({id,h:sp24n(h),a:sp24n(a),date:d,time:t,loc:loc||"Tanahey",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const sp24G=[
    sp24g("sp24-1","Gray","Yellow","2024-03-16","3:50 PM",9,5,"JJW"),sp24g("sp24-2","Bdn Green","BR Purple","2024-03-16","4:35 PM",0,9,"JJW"),sp24g("sp24-3","Red","Black","2024-03-16","5:20 PM",3,2,"JJW"),sp24g("sp24-4","Gold","AR Blue","2024-03-16","6:05 PM",7,6,"JJW"),
    sp24g("sp24-5","Gray","BR Purple","2024-03-23","3:30 PM",2,6,"JJW"),sp24g("sp24-6","Yellow","Bdn Green","2024-03-23","4:10 PM",3,0,"JJW"),sp24g("sp24-7","Black","AR Blue","2024-03-23","4:50 PM",3,0,"JJW"),sp24g("sp24-8","Red","White","2024-03-23","5:30 PM",3,3,"JJW"),
    sp24g("sp24-9","BR Purple","Red","2024-04-06","3:50 PM",1,5),sp24g("sp24-10","Gray","Bdn Green","2024-04-06","4:35 PM",1,1),sp24g("sp24-11","Yellow","Black","2024-04-06","5:20 PM",1,0),sp24g("sp24-12","Gold","White","2024-04-06","6:05 PM",4,0),
    sp24g("sp24-13","Bdn Green","Black","2024-04-13","3:50 PM",1,2),sp24g("sp24-14","Yellow","White","2024-04-13","4:35 PM",1,4),sp24g("sp24-15","Gray","Gold","2024-04-13","5:20 PM",0,1),sp24g("sp24-16","Red","AR Blue","2024-04-13","6:05 PM",2,0),
    sp24g("sp24-17","Gray","White","2024-04-20","3:50 PM",3,1),sp24g("sp24-18","Black","Gold","2024-04-20","4:35 PM",1,3),sp24g("sp24-19","Bdn Green","AR Blue","2024-04-20","5:20 PM",1,6),sp24g("sp24-20","Yellow","BR Purple","2024-04-20","6:05 PM",1,3),
    sp24g("sp24-21","Bdn Green","Red","2024-04-27","3:50 PM",0,1),sp24g("sp24-22","AR Blue","White","2024-04-27","4:35 PM",0,0),sp24g("sp24-23","Black","BR Purple","2024-04-27","5:20 PM",1,0),sp24g("sp24-24","Yellow","Gold","2024-04-27","6:05 PM",0,7),
    sp24g("sp24-25","BR Purple","Gold","2024-05-04","3:50 PM",3,2),sp24g("sp24-26","Gray","AR Blue","2024-05-04","4:35 PM",0,7),sp24g("sp24-27","Bdn Green","White","2024-05-04","5:20 PM",0,3),sp24g("sp24-28","Yellow","Red","2024-05-04","6:05 PM",3,1),
    sp24g("sp24-29","Gray","Black","2024-05-11","3:50 PM",5,2),sp24g("sp24-30","Red","Gold","2024-05-11","4:35 PM",0,4),sp24g("sp24-31","Yellow","AR Blue","2024-05-11","5:20 PM",7,3),sp24g("sp24-32","BR Purple","White","2024-05-11","6:05 PM",0,3),
    sp24g("sp24-33","Gray","Red","2024-05-18","3:50 PM",1,1),sp24g("sp24-34","Bdn Green","Gold","2024-05-18","4:35 PM",0,2),sp24g("sp24-35","Black","White","2024-05-18","5:20 PM",0,3),sp24g("sp24-36","BR Purple","AR Blue","2024-05-18","6:05 PM",1,5),
    // QF
    sp24g("sp24-q1","Gold","Black","2024-06-08","3:50 PM",2,0,"Tanahey","playoff"),sp24g("sp24-q2","White","AR Blue","2024-06-08","4:35 PM",0,1,"Tanahey","playoff"),sp24g("sp24-q3","Red","Gray","2024-06-08","5:20 PM",0,1,"Tanahey","playoff"),sp24g("sp24-q4","BR Purple","Yellow","2024-06-08","6:05 PM",3,1,"Tanahey","playoff"),
    // Semi
    sp24g("sp24-s1","Gold","Gray","2024-06-15","3:50 PM",1,0,"Tanahey","playoff"),sp24g("sp24-s2","BR Purple","AR Blue","2024-06-15","4:50 PM",1,0,"Tanahey","playoff"),
    // Final
    sp24g("sp24-f","BR Purple","Gold","2024-06-22","3:50 PM",1,0,"Tanahey","playoff","https://app.veo.co/matches/20240622-final-purple-gold3b85a200/"),
  ];

  // ===== SUMMER 2024 =====
  // Groups A and B. Champion: BR Purple
  const su24T=[
    {id:"su24-bp",name:"BR Purple",color:"#8E24AA",cap:null,group:"A"},
    {id:"su24-bk",name:"Black",color:"#212121",cap:null,group:"A"},
    {id:"su24-or",name:"Orange",color:"#EF6C00",cap:null,group:"A"},
    {id:"su24-rd",name:"Red",color:"#C62828",cap:null,group:"A"},
    {id:"su24-ng",name:"Neon Green",color:"#64DD17",cap:null,group:"A"},
    {id:"su24-yl",name:"Yellow",color:"#F9A825",cap:null,group:"B"},
    {id:"su24-gd",name:"Gold",color:"#FF8F00",cap:null,group:"B"},
    {id:"su24-bl",name:"AR Blue",color:"#1565C0",cap:null,group:"B"},
    {id:"su24-bg",name:"Bdn Green",color:"#2E7D32",cap:null,group:"B"},
    {id:"su24-wh",name:"White",color:"#BDBDBD",cap:null,group:"B"},
  ];
  const su24n=n=>su24T.find(x=>x.name===n)?.id;
  const su24g=(id,h,a,d,t,hs,as,ph,v)=>({id,h:su24n(h),a:su24n(a),date:d,time:t,loc:"James J Walker",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const su24G=[
    su24g("su24-1","Neon Green","Orange","2024-06-23","8:50 AM",2,6),su24g("su24-2","Red","Black","2024-06-23","9:35 AM",3,5),su24g("su24-3","AR Blue","Bdn Green","2024-06-23","10:20 AM",7,3),su24g("su24-4","Yellow","White","2024-06-23","11:05 AM",6,2),
    su24g("su24-5","AR Blue","White","2024-06-30","8:50 AM",5,3),su24g("su24-6","Gold","Bdn Green","2024-06-30","9:35 AM",6,5),su24g("su24-7","Neon Green","Black","2024-06-30","10:20 AM",4,9),su24g("su24-8","BR Purple","Orange","2024-06-30","11:05 AM",5,4),
    su24g("su24-9","BR Purple","Black","2024-07-14","8:50 AM",7,2),su24g("su24-10","Neon Green","Red","2024-07-14","9:35 AM",2,3),su24g("su24-11","Gold","White","2024-07-14","10:20 AM",2,4),su24g("su24-12","AR Blue","Yellow","2024-07-14","11:05 AM",0,3),
    su24g("su24-13","Bdn Green","Yellow","2024-07-21","8:50 AM",3,5),su24g("su24-14","Gold","AR Blue","2024-07-21","9:35 AM",8,4),su24g("su24-15","BR Purple","Neon Green","2024-07-21","10:20 AM",7,1),su24g("su24-16","Orange","Red","2024-07-21","11:05 AM",6,7),
    su24g("su24-17","BR Purple","Red","2024-07-28","8:50 AM",4,1),su24g("su24-18","Orange","Black","2024-07-28","9:35 AM",4,9),su24g("su24-19","Gold","Yellow","2024-07-28","10:20 AM",10,2),su24g("su24-20","Bdn Green","White","2024-07-28","11:05 AM",5,4),
    su24g("su24-21","BR Purple","Bdn Green","2024-08-03","12:00 PM",5,4),
    su24g("su24-22","Black","White","2024-08-04","8:50 AM",3,4),su24g("su24-23","Red","AR Blue","2024-08-04","9:35 AM",4,11),su24g("su24-24","Orange","Yellow","2024-08-04","10:20 AM",5,5),su24g("su24-25","Neon Green","Gold","2024-08-04","11:05 AM",4,13),
    su24g("su24-26","Orange","White","2024-08-10","12:00 PM",5,2),
    su24g("su24-27","Red","AR Blue","2024-08-11","8:50 AM",3,3),su24g("su24-28","Gold","BR Purple","2024-08-11","9:35 AM",2,7),su24g("su24-29","Neon Green","Bdn Green","2024-08-11","10:20 AM",2,7),su24g("su24-30","Black","Yellow","2024-08-11","11:05 AM",2,5),
    // QF
    su24g("su24-q1","Yellow","Red","2024-08-17","12:00 PM",2,6,"playoff"),su24g("su24-q2","BR Purple","Bdn Green","2024-08-18","8:50 AM",2,1,"playoff"),su24g("su24-q3","AR Blue","Black","2024-08-18","9:35 AM",4,3,"playoff"),su24g("su24-q4","Gold","Orange","2024-08-18","10:20 AM",11,5,"playoff"),
    // Semi
    su24g("su24-s1","BR Purple","AR Blue","2024-08-24","11:05 AM",1,0,"playoff"),su24g("su24-s2","Gold","Yellow","2024-08-25","12:05 PM",1,0,"playoff"),
    // Final
    su24g("su24-f","BR Purple","Gold","2024-08-25","10:00 AM",1,0,"playoff","https://app.veo.co/matches/20240825-purple-gold-summer-24-final-032ea26d/"),
  ];

  // ===== FALL 2024 =====
  // Groups A (7) and B (7). Champion: AR Blue (Blue won over Gold)
  const fa24T=[
    {id:"fa24-ab",name:"AR Blue",color:"#1976D2",cap:null,group:"A"},
    {id:"fa24-bp",name:"BR Purple",color:"#8E24AA",cap:null,group:"A"},
    {id:"fa24-bk",name:"Black",color:"#212121",cap:null,group:"A"},
    {id:"fa24-rd",name:"Red",color:"#C62828",cap:null,group:"A"},
    {id:"fa24-dp",name:"Dark Purple",color:"#7B1FA2",cap:null,group:"A"},
    {id:"fa24-sb",name:"Sky Blue",color:"#039BE5",cap:null,group:"A"},
    {id:"fa24-wh",name:"White",color:"#BDBDBD",cap:null,group:"A"},
    {id:"fa24-gd",name:"Gold",color:"#FF8F00",cap:null,group:"B"},
    {id:"fa24-yl",name:"Yellow",color:"#F9A825",cap:null,group:"B"},
    {id:"fa24-bg",name:"Bdn Green",color:"#2E7D32",cap:null,group:"B"},
    {id:"fa24-or",name:"Orange",color:"#EF6C00",cap:null,group:"B"},
    {id:"fa24-pk",name:"Pink",color:"#E91E63",cap:null,group:"B"},
    {id:"fa24-gy",name:"Gray",color:"#78909C",cap:null,group:"B"},
    {id:"fa24-ng",name:"Neon Green",color:"#64DD17",cap:null,group:"B"},
  ];
  const fa24n=n=>fa24T.find(x=>x.name===n)?.id;
  const fa24g=(id,h,a,d,t,hs,as,ph,v)=>({id,h:fa24n(h),a:fa24n(a),date:d,time:t,loc:"James J Walker",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const fa24G=[
    // W1 9/7 Sat
    fa24g("fa24-1","BR Purple","Red","2024-09-07","9:05 AM",1,2),fa24g("fa24-2","White","Sky Blue","2024-09-07","12:50 PM",3,4),
    // W1 9/8 Sun
    fa24g("fa24-3","Gold","Gray","2024-09-08","10:50 AM",8,1),fa24g("fa24-4","Yellow","Bdn Green","2024-09-08","11:35 AM",4,3),fa24g("fa24-5","Orange","Neon Green","2024-09-08","12:20 PM",6,7),fa24g("fa24-6","AR Blue","Black","2024-09-08","1:05 PM",5,3),
    // 9/14 Sat
    fa24g("fa24-7","Gold","Yellow","2024-09-14","9:05 AM",13,3),fa24g("fa24-8","Pink","Bdn Green","2024-09-14","12:50 PM",4,10),
    // W2 9/15 Sun
    fa24g("fa24-9","Red","White","2024-09-15","10:50 AM",4,3),fa24g("fa24-10","Orange","Gray","2024-09-15","11:35 AM",5,2),fa24g("fa24-11","Black","Dark Purple","2024-09-15","12:20 PM",7,3),fa24g("fa24-12","BR Purple","AR Blue","2024-09-15","1:05 PM",6,9),
    // W3 9/22 Sun
    fa24g("fa24-13","BR Purple","Black","2024-09-22","10:50 AM",3,1),fa24g("fa24-14","Bdn Green","Gray","2024-09-22","11:35 AM",2,0),fa24g("fa24-15","Red","Sky Blue","2024-09-22","12:20 PM",4,1),fa24g("fa24-16","Yellow","Neon Green","2024-09-22","1:05 PM",6,4),
    // W4 9/29 Sun
    fa24g("fa24-17","AR Blue","White","2024-09-29","10:50 AM",8,5),fa24g("fa24-18","Red","Dark Purple","2024-09-29","11:35 AM",1,2),fa24g("fa24-19","Gold","Orange","2024-09-29","12:20 PM",7,4),fa24g("fa24-20","Pink","Gray","2024-09-29","1:05 PM",3,2),
    // 10/5 Sat
    fa24g("fa24-21","BR Purple","White","2024-10-05","9:05 AM",4,1),fa24g("fa24-22","Black","Sky Blue","2024-10-05","12:50 PM",4,2),
    // W5 10/6 Sun
    fa24g("fa24-23","Orange","Bdn Green","2024-10-06","10:50 AM",4,3),fa24g("fa24-24","Yellow","Pink","2024-10-06","11:35 AM",5,3),fa24g("fa24-25","Gold","Neon Green","2024-10-06","12:20 PM",10,2),fa24g("fa24-26","AR Blue","Dark Purple","2024-10-06","1:05 PM",3,0),
    // W6 10/13 Sun
    fa24g("fa24-27","Black","Red","2024-10-13","10:50 AM",4,2),fa24g("fa24-28","Orange","Pink","2024-10-13","11:35 AM",5,1),fa24g("fa24-29","Yellow","Gray","2024-10-13","12:20 PM",2,1),fa24g("fa24-30","BR Purple","Sky Blue","2024-10-13","1:05 PM",6,1),
    // W7 10/20 Sun
    fa24g("fa24-31","White","Dark Purple","2024-10-20","10:50 AM",3,4),fa24g("fa24-32","AR Blue","Sky Blue","2024-10-20","11:35 AM",5,3),fa24g("fa24-33","Gold","Bdn Green","2024-10-20","12:20 PM",3,0),fa24g("fa24-34","Pink","Neon Green","2024-10-20","1:05 PM",2,1),
    // W8 10/27 Sun
    fa24g("fa24-35","Neon Green","Gray","2024-10-27","10:50 AM",1,4),fa24g("fa24-36","Yellow","Orange","2024-10-27","11:35 AM",8,2),fa24g("fa24-37","BR Purple","Dark Purple","2024-10-27","12:20 PM",7,4),fa24g("fa24-38","Black","White","2024-10-27","1:05 PM",3,3),
    // W9 11/3 Sun
    fa24g("fa24-39","Neon Green","Bdn Green","2024-11-03","10:50 AM",3,5),fa24g("fa24-40","Sky Blue","Dark Purple","2024-11-03","11:35 AM",3,4),fa24g("fa24-41","Gold","Pink","2024-11-03","12:20 PM",4,4),fa24g("fa24-42","AR Blue","Red","2024-11-03","1:05 PM",11,5),
    // Qtr Wk10 11/10
    fa24g("fa24-q1","Gold","Red","2024-11-10","10:50 AM",2,1,"playoff"),fa24g("fa24-q2","AR Blue","Orange","2024-11-10","11:35 AM",11,2,"playoff"),fa24g("fa24-q3","Black","Yellow","2024-11-10","12:20 PM",5,4,"playoff"),fa24g("fa24-q4","Bdn Green","BR Purple","2024-11-10","1:05 PM",5,4,"playoff"),
    // Semi W11 11/17
    fa24g("fa24-s1","Gold","Bdn Green","2024-11-17","10:50 AM",8,5,"playoff"),fa24g("fa24-s2","AR Blue","Black","2024-11-17","11:50 AM",7,5,"playoff"),
    // Final - Blue won over Gold
    fa24g("fa24-f","AR Blue","Gold","2024-11-24","10:50 AM",1,0,"playoff","https://app.veo.co/matches/20241124-blue-gold-final-29a6d689/"),
  ];

  // ===== SPRING 2023 =====
  // No groups, 12 teams. Champion: Orange (beat AR Blue via PKs in final)
  const sp23T=[
    {id:"sp23-or",name:"Orange",color:"#EF6C00",cap:null,group:""},
    {id:"sp23-yl",name:"Yellow",color:"#F9A825",cap:null,group:""},
    {id:"sp23-bl",name:"AR Blue",color:"#1565C0",cap:null,group:""},
    {id:"sp23-rd",name:"Red",color:"#C62828",cap:null,group:""},
    {id:"sp23-ng",name:"Neon Green",color:"#64DD17",cap:null,group:""},
    {id:"sp23-wh",name:"White",color:"#BDBDBD",cap:null,group:""},
    {id:"sp23-gy",name:"Gray",color:"#78909C",cap:null,group:""},
    {id:"sp23-gd",name:"Gold",color:"#FF8F00",cap:null,group:""},
    {id:"sp23-pk",name:"Pink",color:"#E91E63",cap:null,group:""},
    {id:"sp23-bk",name:"Black",color:"#212121",cap:null,group:""},
    {id:"sp23-bg",name:"Bdn Green",color:"#2E7D32",cap:null,group:""},
    {id:"sp23-pu",name:"Purple",color:"#9C27B0",cap:null,group:""},
  ];
  const sp23n=n=>sp23T.find(x=>x.name===n)?.id;
  const sp23g=(id,h,a,d,t,hs,as,loc,ph,v)=>({id,h:sp23n(h),a:sp23n(a),date:d,time:t,loc:loc||"Tanahey",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const sp23G=[
    sp23g("sp23-1","Red","Black","2023-03-11","10:00 AM",7,2,"JJW"),
    sp23g("sp23-2","Yellow","Orange","2023-03-12","10:00 AM",3,2,"JJW"),sp23g("sp23-3","White","Gold","2023-03-12","10:45 AM",4,7,"JJW"),sp23g("sp23-4","Gray","Purple","2023-03-12","11:30 AM",9,3,"JJW"),
    sp23g("sp23-5","Red","Gold","2023-03-18","10:00 AM",2,0),sp23g("sp23-6","Yellow","AR Blue","2023-03-18","10:45 AM",3,0),sp23g("sp23-7","Black","Neon Green","2023-03-18","11:30 AM",0,2),sp23g("sp23-8","Gray","Pink","2023-03-18","12:15 PM",0,1),
    sp23g("sp23-9","Orange","Bdn Green","2023-03-19","10:00 AM",9,0,"Robert Moses"),
    sp23g("sp23-10","White","Purple","2023-03-25","10:00 AM",4,0),sp23g("sp23-11","Neon Green","Pink","2023-03-25","10:45 AM",7,0),sp23g("sp23-12","Bdn Green","AR Blue","2023-03-25","11:30 AM",2,10),sp23g("sp23-13","Black","Orange","2023-03-25","12:15 PM",2,3),
    sp23g("sp23-14","Red","Yellow","2023-03-26","10:00 AM",3,0,"Robert Moses"),
    sp23g("sp23-15","Orange","Gray","2023-04-01","10:00 AM",2,0),sp23g("sp23-16","Black","Gold","2023-04-01","10:45 AM",3,1),sp23g("sp23-17","Red","White","2023-04-01","11:30 AM",0,0),sp23g("sp23-18","Yellow","Purple","2023-04-01","12:15 PM",3,0),
    sp23g("sp23-19","Neon Green","AR Blue","2023-04-02","10:00 AM",7,1,"Robert Moses"),sp23g("sp23-20","Pink","AR Blue","2023-04-02","10:45 AM",1,4,"Robert Moses"),
    sp23g("sp23-21","Red","Purple","2023-04-15","10:00 AM",3,0,"Nike Field"),sp23g("sp23-22","Yellow","Gold","2023-04-15","10:45 AM",6,1,"Nike Field"),
    sp23g("sp23-23","White","Gray","2023-04-16","10:00 AM",0,1,"Robert Moses"),sp23g("sp23-24","Pink","Bdn Green","2023-04-16","10:45 AM",0,3,"Robert Moses"),sp23g("sp23-25","Black","AR Blue","2023-04-16","11:30 AM",0,2,"Robert Moses"),sp23g("sp23-26","Orange","Neon Green","2023-04-16","12:15 PM",6,2,"Robert Moses"),
    sp23g("sp23-27","White","Neon Green","2023-04-22","10:00 AM",4,0),sp23g("sp23-28","Orange","Pink","2023-04-22","10:45 AM",2,3),
    sp23g("sp23-29","Gold","Purple","2023-04-23","10:00 AM",8,0,"Robert Moses"),sp23g("sp23-30","Gray","Bdn Green","2023-04-23","10:45 AM",2,4,"Robert Moses"),sp23g("sp23-31","Black","AR Blue","2023-04-23","11:30 AM",2,2,"Robert Moses"),sp23g("sp23-32","Red","AR Blue","2023-04-23","12:15 PM",0,1,"Robert Moses"),
    sp23g("sp23-33","Red","Bdn Green","2023-04-29","10:00 AM",3,0),sp23g("sp23-34","Purple","Gold","2023-04-29","10:45 AM",0,0),sp23g("sp23-35","Orange","Gray","2023-04-29","11:30 AM",0,0),
    sp23g("sp23-36","Orange","AR Blue","2023-04-30","10:00 AM",2,1,"Robert Moses"),sp23g("sp23-37","Yellow","Neon Green","2023-04-30","10:45 AM",1,2,"Robert Moses"),
    sp23g("sp23-38","Gray","AR Blue","2023-05-06","10:00 AM",2,1),sp23g("sp23-39","Red","Pink","2023-05-06","10:45 AM",2,2),
    sp23g("sp23-40","Black","Bdn Green","2023-05-07","10:00 AM",4,3,"Robert Moses"),sp23g("sp23-41","Purple","Neon Green","2023-05-07","10:45 AM",2,11,"Robert Moses"),sp23g("sp23-42","Orange","Gold","2023-05-07","11:30 AM",2,1,"Robert Moses"),sp23g("sp23-43","Yellow","White","2023-05-07","12:15 PM",2,3,"Robert Moses"),
    sp23g("sp23-44","Purple","AR Blue","2023-05-13","10:00 AM",1,1),sp23g("sp23-45","Orange","White","2023-05-13","10:45 AM",1,1),
    sp23g("sp23-46","Red","Neon Green","2023-05-14","10:00 AM",4,1,"Robert Moses"),sp23g("sp23-47","Gold","AR Blue","2023-05-14","10:45 AM",1,3,"Robert Moses"),sp23g("sp23-48","Black","Pink","2023-05-14","11:30 AM",7,1,"Robert Moses"),sp23g("sp23-49","Yellow","Gray","2023-05-14","12:15 PM",4,1,"Robert Moses"),
    sp23g("sp23-50","Purple","AR Blue","2023-05-20","10:00 AM",0,3),sp23g("sp23-51","Red","Orange","2023-05-20","10:45 AM",1,5),sp23g("sp23-52","Gold","Neon Green","2023-05-20","11:30 AM",3,6),sp23g("sp23-53","Black","Gray","2023-05-20","12:15 PM",2,2),
    sp23g("sp23-54","Yellow","Pink","2023-05-21","10:00 AM",9,0,"Booker T"),sp23g("sp23-55","White","Bdn Green","2023-05-21","10:45 AM",9,4,"Booker T"),
    sp23g("sp23-56","Orange","Purple","2023-06-03","10:00 AM",3,0),sp23g("sp23-57","White","AR Blue","2023-06-03","10:45 AM",2,6),sp23g("sp23-58","Gray","Neon Green","2023-06-03","11:30 AM",0,3),sp23g("sp23-59","Yellow","Bdn Green","2023-06-03","12:15 PM",3,0),sp23g("sp23-60","Gold","Pink","2023-06-03","12:15 PM",6,2),
    sp23g("sp23-61","Neon Green","AR Blue","2023-06-10","10:00 AM",0,3),sp23g("sp23-62","Red","Gray","2023-06-10","10:45 AM",3,0),sp23g("sp23-63","White","Pink","2023-06-10","11:30 AM",0,0),
    // Semi
    sp23g("sp23-s1","Orange","Red","2023-06-17","10:00 AM",1,1,"Tanahey","playoff"),
    sp23g("sp23-s2","AR Blue","Yellow","2023-06-17","11:00 AM",1,1,"Tanahey","playoff"),
    // Final - Orange 1-1 Blue (Orange 5-4 PKs)
    sp23g("sp23-f","Orange","AR Blue","2023-06-24","10:00 AM",1,1,"Tanahey","playoff","https://app.veo.co/matches/20230624-orange-blue-final-spring-2023-c92cb4e9/"),
  ];


// ============ WINTER 2024 ============
  // Group A: Black, AR Blue, Yellow, Neon Green, Gray, Red
  // Group B: BR Purple, Gold, Orange, Dark Purple, White, Sky Blue
  // Champion: Black (beat Purple via PKs in final)
  const w24teams = [
    {id:"w24-bk",name:"Black",color:"#212121",cap:null,group:"A"},
    {id:"w24-ab",name:"AR Blue",color:"#1565C0",cap:null,group:"A"},
    {id:"w24-yl",name:"Yellow",color:"#F9A825",cap:null,group:"A"},
    {id:"w24-ng",name:"Neon Green",color:"#64DD17",cap:null,group:"A"},
    {id:"w24-gy",name:"Gray",color:"#78909C",cap:null,group:"A"},
    {id:"w24-rd",name:"Red",color:"#C62828",cap:null,group:"A"},
    {id:"w24-bp",name:"BR Purple",color:"#8E24AA",cap:null,group:"B"},
    {id:"w24-gd",name:"Gold",color:"#FF8F00",cap:null,group:"B"},
    {id:"w24-or",name:"Orange",color:"#EF6C00",cap:null,group:"B"},
    {id:"w24-dp",name:"Dark Purple",color:"#7B1FA2",cap:null,group:"B"},
    {id:"w24-wh",name:"White",color:"#BDBDBD",cap:null,group:"B"},
    {id:"w24-sb",name:"Sky Blue",color:"#039BE5",cap:null,group:"B"},
  ];
  const w24t = n => w24teams.find(x=>x.name===n)?.id;
  const w24g = (id,h,a,d,time,hs,as,ph,v) => ({id,h:w24t(h),a:w24t(a),date:d,time,loc:"James J Walker",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const w24games = [
    // W1 12/7/23 Sat
    w24g("w24-1","White","Sky Blue","2023-12-07","10:20 AM",5,5),
    w24g("w24-2","BR Purple","Dark Purple","2023-12-07","11:05 AM",5,4),
    w24g("w24-3","Orange","Gold","2023-12-07","11:50 AM",4,6),
    // W1 12/8/23 Sun
    w24g("w24-4","Red","Black","2023-12-08","10:20 AM",1,6),
    w24g("w24-5","Neon Green","Gray","2023-12-08","11:05 AM",3,2),
    w24g("w24-6","AR Blue","Yellow","2023-12-08","11:50 AM",5,1),
    // W2 12/14 Sat
    w24g("w24-7","AR Blue","Neon Green","2023-12-14","10:20 AM",6,1),
    w24g("w24-8","Yellow","Gray","2023-12-14","11:05 AM",6,2),
    // W2 12/15 Sun
    w24g("w24-9","Orange","BR Purple","2023-12-15","10:20 AM",3,6),
    w24g("w24-10","Gold","Dark Purple","2023-12-15","11:05 AM",5,5),
    // W5 1/4/24 Sat
    w24g("w24-11","Yellow","Black","2024-01-04","10:20 AM",1,2),
    w24g("w24-12","Neon Green","Red","2024-01-04","11:05 AM",6,2),
    // W5 1/5/24 Sun
    w24g("w24-13","Gold","Sky Blue","2024-01-05","10:20 AM",5,2),
    w24g("w24-14","BR Purple","White","2024-01-05","11:05 AM",10,4),
    // W6 1/11/24 Sat
    w24g("w24-15","Gray","Red","2024-01-11","10:20 AM",2,4),
    w24g("w24-16","Yellow","Neon Green","2024-01-11","11:05 AM",2,2),
    w24g("w24-17","AR Blue","Black","2024-01-11","11:50 AM",4,6),
    // W6 1/12/24 Sun
    w24g("w24-18","Dark Purple","White","2024-01-12","10:20 AM",7,1),
    w24g("w24-19","Gold","BR Purple","2024-01-12","11:05 AM",5,5),
    w24g("w24-20","Orange","Sky Blue","2024-01-12","11:50 AM",7,2),
    // W7 1/18/24 Sat
    w24g("w24-21","Orange","Dark Purple","2024-01-18","10:20 AM",6,4),
    w24g("w24-22","Gold","White","2024-01-18","11:05 AM",4,1),
    w24g("w24-23","BR Purple","Sky Blue","2024-01-18","11:50 AM",5,0),
    // W7 1/19/24 Sun
    w24g("w24-24","AR Blue","Gray","2024-01-19","10:20 AM",4,2),
    w24g("w24-25","Yellow","Red","2024-01-19","11:05 AM",5,2),
    w24g("w24-26","Neon Green","Black","2024-01-19","11:50 AM",4,7),
    // W9 2/1/24 Sat
    w24g("w24-27","AR Blue","Red","2024-02-01","10:20 AM",13,4),
    w24g("w24-28","Gray","Black","2024-02-01","11:05 AM",3,5),
    // W9 2/2/24 Sun
    w24g("w24-29","Orange","White","2024-02-02","10:20 AM",4,3),
    w24g("w24-30","Dark Purple","Sky Blue","2024-02-02","11:05 AM",4,1),
    // W10 2/8/24 Sat
    w24g("w24-31","Gray","Sky Blue","2024-02-08","10:20 AM",5,2),
    w24g("w24-32","BR Purple","Black","2024-02-08","11:05 AM",5,3),
    w24g("w24-33","AR Blue","Gold","2024-02-08","11:50 AM",2,6),
    // W10 2/9/24 Sun
    w24g("w24-34","Yellow","Orange","2024-02-09","10:20 AM",6,3),
    w24g("w24-35","Dark Purple","Neon Green","2024-02-09","11:05 AM",5,2),
    w24g("w24-36","White","Red","2024-02-09","11:50 AM",7,1),
    // W12 2/22/24 Sat (cross-group)
    w24g("w24-37","BR Purple","Gray","2024-02-22","10:20 AM",2,4),
    w24g("w24-38","Gold","Red","2024-02-22","11:05 AM",5,7),
    w24g("w24-39","Orange","Neon Green","2024-02-22","11:50 AM",5,4),
    // W12 2/23/24 Sun
    w24g("w24-40","Black","Sky Blue","2024-02-23","10:20 AM",12,1),
    w24g("w24-41","AR Blue","White","2024-02-23","11:05 AM",10,6),
    w24g("w24-42","Yellow","Dark Purple","2024-02-23","11:50 AM",6,2),
    // QF (Semi) 3/2/25 Sun - using the screenshot data
    // Semi: AR Blue vs BR Purple, Black vs Gold
    w24g("w24-s1","AR Blue","BR Purple","2025-03-02","10:00 AM",0,1,"playoff"),
    w24g("w24-s2","Black","Gold","2025-03-02","11:00 AM",1,0,"playoff"),
    // Final 3/9/25: Purple vs Black (Black won via PKs)
    w24g("w24-f","BR Purple","Black","2025-03-09","10:00 AM",0,1,"playoff"),
  ];

  // ============ SPRING 2025 ============
  // Group A: AR Blue, Neon Green, Dark Purple, Yellow, Black, Gray
  // Group B: BR Purple, Bdn Green, Gold, Red, Orange, Sky Blue
  // Champion: AR Blue (beat Dark Purple in final)
  const sp25teams = [
    {id:"sp25-ab",name:"AR Blue",color:"#1565C0",cap:null,group:"A"},
    {id:"sp25-ng",name:"Neon Green",color:"#64DD17",cap:null,group:"A"},
    {id:"sp25-dp",name:"Dark Purple",color:"#7B1FA2",cap:null,group:"A"},
    {id:"sp25-yl",name:"Yellow",color:"#F9A825",cap:null,group:"A"},
    {id:"sp25-bk",name:"Black",color:"#212121",cap:null,group:"A"},
    {id:"sp25-gy",name:"Gray",color:"#78909C",cap:null,group:"A"},
    {id:"sp25-bp",name:"BR Purple",color:"#8E24AA",cap:null,group:"B"},
    {id:"sp25-bg",name:"Bdn Green",color:"#2E7D32",cap:null,group:"B"},
    {id:"sp25-gd",name:"Gold",color:"#FF8F00",cap:null,group:"B"},
    {id:"sp25-rd",name:"Red",color:"#C62828",cap:null,group:"B"},
    {id:"sp25-or",name:"Orange",color:"#EF6C00",cap:null,group:"B"},
    {id:"sp25-sb",name:"Sky Blue",color:"#039BE5",cap:null,group:"B"},
  ];
  const sp25t = n => sp25teams.find(x=>x.name===n)?.id;
  const sp25g = (id,h,a,d,time,hs,as,loc,ph,v) => ({id,h:sp25t(h),a:sp25t(a),date:d,time,loc:loc||"JJW",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const sp25games = [
    // Winter semis played on 3/2 (on spring schedule but belong to winter)
    // Spring W1 3/1/25 Sat (first actual spring games)
    sp25g("sp25-1","Red","Bdn Green","2025-03-01","10:20 AM",9,3,"JJW"),
    sp25g("sp25-2","Yellow","Dark Purple","2025-03-01","11:05 AM",4,8,"JJW"),
    sp25g("sp25-3","Neon Green","Gray","2025-03-01","11:50 AM",7,3,"JJW"),
    // W2 3/8/25 Sat
    sp25g("sp25-4","Gold","Red","2025-03-08","10:20 AM",10,2,"JJW"),
    sp25g("sp25-5","Yellow","Gray","2025-03-08","11:05 AM",5,7,"JJW"),
    sp25g("sp25-6","Neon Green","Dark Purple","2025-03-08","11:50 AM",3,3,"JJW"),
    // W2 3/9/25 Sun
    // Winter final on this date (Purple vs Black) - skip, belongs to winter
    sp25g("sp25-7","Bdn Green","Sky Blue","2025-03-09","11:05 AM",11,1,"JJW"),
    // W3 3/15/25 Sat
    sp25g("sp25-8","Red","Sky Blue","2025-03-15","8:50 AM",3,1,"JJW"),
    sp25g("sp25-9","Black","Gray","2025-03-15","9:35 AM",2,3,"JJW"),
    sp25g("sp25-10","Orange","Bdn Green","2025-03-15","10:20 AM",8,1,"JJW"),
    sp25g("sp25-11","AR Blue","Neon Green","2025-03-15","11:05 AM",5,2,"JJW"),
    // W3 3/16/25 Sun
    sp25g("sp25-12","BR Purple","Gold","2025-03-16","9:00 AM",3,0,"CP"),
    // W4 3/22/25 Sat
    sp25g("sp25-13","BR Purple","Orange","2025-03-22","3:20 PM",4,3,"RMP"),
    sp25g("sp25-14","Gray","Dark Purple","2025-03-22","4:05 PM",3,3,"RMP"),
    sp25g("sp25-15","Gold","Sky Blue","2025-03-22","4:50 PM",8,2,"RMP"),
    sp25g("sp25-16","Black","AR Blue","2025-03-22","5:35 PM",4,3,"RMP"),
    // W5 3/29/25 Sat
    sp25g("sp25-17","AR Blue","Gray","2025-03-29","3:20 PM",6,1,"RMP"),
    sp25g("sp25-18","Yellow","Neon Green","2025-03-29","4:05 PM",5,3,"RMP"),
    sp25g("sp25-19","Black","Dark Purple","2025-03-29","4:50 PM",0,1,"RMP"),
    // W5 3/30/25 Sun
    sp25g("sp25-20","BR Purple","Red","2025-03-30","9:15 AM",4,2,"CP"),
    sp25g("sp25-21","Gold","Bdn Green","2025-03-30","9:50 AM",3,4,"CP"),
    sp25g("sp25-22","Orange","Sky Blue","2025-03-30","10:20 AM",0,3,"CP"),
    // W6 4/5/25 Sat
    sp25g("sp25-23","BR Purple","Bdn Green","2025-04-05","3:50 PM",0,3,"Tanahey"),
    sp25g("sp25-24","Gold","Orange","2025-04-05","4:35 PM",3,0,"Tanahey"),
    sp25g("sp25-25","AR Blue","Dark Purple","2025-04-05","5:20 PM",5,1,"Tanahey"),
    sp25g("sp25-26","Black","Yellow","2025-04-05","6:05 PM",0,1,"Tanahey"),
    // W7 4/12/25 Sat
    sp25g("sp25-27","Black","Neon Green","2025-04-12","3:50 PM",0,3,"Tanahey"),
    sp25g("sp25-28","AR Blue","Yellow","2025-04-12","4:35 PM",4,2,"Tanahey"),
    sp25g("sp25-29","BR Purple","Sky Blue","2025-04-12","5:20 PM",3,0,"Tanahey"),
    sp25g("sp25-30","Orange","Red","2025-04-12","6:05 PM",0,3,"Tanahey"),
    // W9 4/26/25 Sat
    sp25g("sp25-31","Black","Sky Blue","2025-04-26","9:50 AM",6,3,"CP"),
    sp25g("sp25-32","Gray","Gold","2025-04-26","10:35 AM",1,1,"CP"),
    sp25g("sp25-33","Dark Purple","BR Purple","2025-04-26","11:20 AM",1,5,"CP"),
    // W10 5/3/25 Sat
    sp25g("sp25-34","AR Blue","Bdn Green","2025-05-03","1:50 PM",10,4,"RMP"),
    sp25g("sp25-35","Neon Green","Orange","2025-05-03","2:35 PM",5,4,"RMP"),
    sp25g("sp25-36","Yellow","Red","2025-05-03","3:20 PM",5,5,"RMP"),
    // W11 5/10/25 Sat
    sp25g("sp25-37","Black","BR Purple","2025-05-10","1:50 PM",2,1,"RMP"),
    sp25g("sp25-38","Neon Green","Red","2025-05-10","3:20 PM",5,3,"RMP"),
    sp25g("sp25-39","Yellow","Orange","2025-05-10","4:05 PM",3,0,"RMP"),
    // W12 5/17/25 Sat
    sp25g("sp25-40","Gray","Bdn Green","2025-05-17","1:50 PM",1,3,"RMP"),
    sp25g("sp25-41","Dark Purple","Sky Blue","2025-05-17","2:35 PM",5,1,"RMP"),
    sp25g("sp25-42","AR Blue","Gold","2025-05-17","3:20 PM",6,1,"RMP"),
    // W15 6/7/25 Sat
    sp25g("sp25-43","Dark Purple","Bdn Green","2025-06-07","1:50 PM",2,0,"RMP"),
    sp25g("sp25-44","Neon Green","Gold","2025-06-07","2:35 PM",1,3,"RMP"),
    sp25g("sp25-45","AR Blue","Red","2025-06-07","3:20 PM",8,3,"RMP"),
    sp25g("sp25-46","BR Purple","Yellow","2025-06-07","4:05 PM",4,3,"RMP"),
    // Semi 6/14/25
    sp25g("sp25-s1","BR Purple","Dark Purple","2025-06-14","2:00 PM",0,1,"RMP","playoff"),
    sp25g("sp25-s2","AR Blue","Gold","2025-06-14","3:00 PM",1,0,"RMP","playoff"),
    // Final
    sp25g("sp25-f","AR Blue","Dark Purple","2025-06-14","4:00 PM",1,0,"RMP","playoff"),
  ];

  // ============ SUMMER 2025 ============
  // Group A: Dark Purple, BR Purple, Neon Green, Orange, Red (5 teams)
  // Group B: AR Blue, Yellow, Bdn Green, Gold, Sky Blue (5 teams)
  // Champion: AR Blue (beat Dark Purple in final)
  const su25teams = [
    {id:"su25-dp",name:"Dark Purple",color:"#7B1FA2",cap:null,group:"A"},
    {id:"su25-bp",name:"BR Purple",color:"#8E24AA",cap:null,group:"A"},
    {id:"su25-ng",name:"Neon Green",color:"#64DD17",cap:null,group:"A"},
    {id:"su25-or",name:"Orange",color:"#EF6C00",cap:null,group:"A"},
    {id:"su25-rd",name:"Red",color:"#C62828",cap:null,group:"A"},
    {id:"su25-ab",name:"AR Blue",color:"#1565C0",cap:null,group:"B"},
    {id:"su25-yl",name:"Yellow",color:"#F9A825",cap:null,group:"B"},
    {id:"su25-bg",name:"Bdn Green",color:"#2E7D32",cap:null,group:"B"},
    {id:"su25-gd",name:"Gold",color:"#FF8F00",cap:null,group:"B"},
    {id:"su25-sb",name:"Sky Blue",color:"#039BE5",cap:null,group:"B"},
  ];
  const su25t = n => su25teams.find(x=>x.name===n)?.id;
  const su25g = (id,h,a,d,time,hs,as,ph,v) => ({id,h:su25t(h),a:su25t(a),date:d,time,loc:"James J Walker",hs,as,done:true,phase:ph||"group",videoUrl:v||""});
  const su25games = [
    // W1 6/22/25
    su25g("su25-1","Red","BR Purple","2025-06-22","8:50 AM",0,3),
    su25g("su25-2","Neon Green","Orange","2025-06-22","9:35 AM",10,3),
    // Gold vs Bdn Green postponed - skip
    su25g("su25-3","Yellow","Sky Blue","2025-06-22","11:05 AM",5,8),
    // 6/28 Sat
    su25g("su25-4","Gold","Bdn Green","2025-06-28","12:00 PM",13,2),
    // W2 6/29/25
    su25g("su25-5","Dark Purple","Orange","2025-06-29","8:50 AM",9,4),
    su25g("su25-6","Yellow","Bdn Green","2025-06-29","9:35 AM",5,4),
    su25g("su25-7","BR Purple","Neon Green","2025-06-29","10:20 AM",2,2),
    su25g("su25-8","AR Blue","Sky Blue","2025-06-29","11:05 AM",10,8),
    // W3 7/13/25
    su25g("su25-9","Gold","Sky Blue","2025-07-13","8:50 AM",4,4),
    su25g("su25-10","Red","Neon Green","2025-07-13","9:35 AM",1,10),
    su25g("su25-11","Dark Purple","BR Purple","2025-07-13","10:20 AM",5,5),
    su25g("su25-12","AR Blue","Yellow","2025-07-13","11:05 AM",4,2),
    // W4 7/20/25
    su25g("su25-13","Orange","BR Purple","2025-07-20","8:50 AM",5,6),
    su25g("su25-14","Red","Dark Purple","2025-07-20","9:35 AM",5,5),
    su25g("su25-15","Yellow","Gold","2025-07-20","10:20 AM",7,4),
    su25g("su25-16","Bdn Green","AR Blue","2025-07-20","11:05 AM",6,3),
    // W5 7/27/25
    su25g("su25-17","Gold","AR Blue","2025-07-27","8:50 AM",1,5),
    su25g("su25-18","Orange","Red","2025-07-27","9:35 AM",5,4),
    su25g("su25-19","Sky Blue","Bdn Green","2025-07-27","10:20 AM",5,8),
    su25g("su25-20","Dark Purple","Neon Green","2025-07-27","11:05 AM",4,3),
    // W6 8/2 Sat
    su25g("su25-21","Dark Purple","Sky Blue","2025-08-02","12:00 PM",6,3),
    // W6 8/3 Sun
    su25g("su25-22","BR Purple","Gold","2025-08-03","8:50 AM",7,5),
    su25g("su25-23","Neon Green","Bdn Green","2025-08-03","9:35 AM",3,9),
    su25g("su25-24","Orange","Yellow","2025-08-03","10:20 AM",6,5),
    su25g("su25-25","Red","AR Blue","2025-08-03","11:05 AM",2,11),
    // W7 8/9 Sat
    su25g("su25-26","Neon Green","Bdn Green","2025-08-09","12:00 PM",8,4),
    // W7 8/10 Sun
    su25g("su25-27","Dark Purple","AR Blue","2025-08-10","8:50 AM",5,4),
    su25g("su25-28","BR Purple","Yellow","2025-08-10","9:35 AM",3,4),
    su25g("su25-29","Orange","Gold","2025-08-10","10:20 AM",7,6),
    su25g("su25-30","Red","Sky Blue","2025-08-10","11:05 AM",6,3),
    // QF 8/17/25
    su25g("su25-q1","Neon Green","Yellow","2025-08-17","8:50 AM",5,5,"playoff"), // Neon Green won PKs 3-2
    su25g("su25-q2","BR Purple","Bdn Green","2025-08-17","9:35 AM",7,5,"playoff"),
    su25g("su25-q3","Orange","AR Blue","2025-08-17","10:20 AM",3,6,"playoff"),
    su25g("su25-q4","Dark Purple","Gold","2025-08-17","11:05 AM",7,6,"playoff"),
    // Semi 8/24/25
    su25g("su25-s1","Dark Purple","Neon Green","2025-08-24","9:00 AM",1,0,"playoff"),
    su25g("su25-s2","AR Blue","BR Purple","2025-08-24","10:00 AM",1,0,"playoff"),
    // Final 8/30/25
    su25g("su25-f","AR Blue","Dark Purple","2025-08-30","10:00 AM",1,0,"playoff"),
  ];

  
  return [
    {id:"fall-2021",name:"Fall 2021",status:"completed",start:"2021-09-12",end:"2021-11-21",teams:f21T,games:f21G,groups:["1","2"],champion:"AR Blue"},
    {id:"winter-2021",name:"Winter 2021-2022",status:"completed",start:"2021-12-05",end:"2022-03-13",teams:w21T,games:w21G,groups:[],champion:"AR Blue"},
    {id:"spring-2022",name:"Spring 2022",status:"completed",start:"2022-03-27",end:"2022-06-12",teams:sp22T,games:sp22G,groups:[],champion:"Yellow"},
    {id:"summer-2022",name:"Summer 2022",status:"completed",start:"2022-06-25",end:"2022-09-10",teams:su22T,games:su22G,groups:[],champion:"AR Blue"},
    {id:"fall-2022",name:"Fall 2022",status:"completed",start:"2022-09-11",end:"2022-12-11",teams:fa22T,games:fa22G,groups:[],champion:"AR Blue"},
    {id:"winter-2022",name:"Winter 2022-2023",status:"completed",start:"2022-12-03",end:"2023-03-05",teams:w22T,games:w22G,groups:[],champion:"Green"},



    {id:"spring-2023",name:"Spring 2023",status:"completed",start:"2023-03-11",end:"2023-06-24",teams:sp23T,games:sp23G,groups:[],champion:"Orange"},
    {id:"summer-2023",name:"Summer 2023",status:"completed",start:"2023-06-24",end:"2023-09-16",teams:su23T,games:su23G,groups:[],champion:"Green"},
    {id:"fall-2023",name:"Fall 2023",status:"completed",start:"2023-09-10",end:"2023-12-10",teams:fa23T,games:fa23G,groups:["A","B"],champion:"BR Purple"},
    {id:"winter-2023",name:"Winter 2023-2024",status:"completed",start:"2023-12-02",end:"2024-03-10",teams:w23T,games:w23G,groups:["A","B"],champion:"BR Purple"},
    {id:"spring-2024",name:"Spring 2024",status:"completed",start:"2024-03-16",end:"2024-06-22",teams:sp24T,games:sp24G,groups:[],champion:"BR Purple"},
    {id:"summer-2024",name:"Summer 2024",status:"completed",start:"2024-06-23",end:"2024-08-25",teams:su24T,games:su24G,groups:["A","B"],champion:"BR Purple"},
    {id:"fall-2024",name:"Fall 2024",status:"completed",start:"2024-09-07",end:"2024-11-24",teams:fa24T,games:fa24G,groups:["A","B"],champion:"AR Blue"},
    {id:"winter-2024",name:"Winter 2024-2025",status:"completed",start:"2023-12-07",end:"2025-03-09",teams:w24teams,games:w24games,groups:["A","B"],champion:"Black"},
    {id:"spring-2025",name:"Spring 2025",status:"completed",start:"2025-03-01",end:"2025-06-14",teams:sp25teams,games:sp25games,groups:["A","B"],champion:"AR Blue"},
    {id:"summer-2025",name:"Summer 2025",status:"completed",start:"2025-06-22",end:"2025-08-30",teams:su25teams,games:su25games,groups:["A","B"],champion:"AR Blue"},
  ];
};


function fall2025() {
  const T = [
    {id:"f-dp",name:"Dark Purple",color:"#7B1FA2",cap:null,group:"A"},
    {id:"f-bk",name:"Black",color:"#212121",cap:null,group:"A"},
    {id:"f-ab",name:"AR Blue",color:"#1565C0",cap:null,group:"A"},
    {id:"f-yl",name:"Yellow",color:"#F9A825",cap:null,group:"A"},
    {id:"f-or",name:"Orange",color:"#EF6C00",cap:null,group:"A"},
    {id:"f-rd",name:"Red",color:"#C62828",cap:null,group:"A"},
    {id:"f-gd",name:"Gold",color:"#FF8F00",cap:null,group:"B"},
    {id:"f-ng",name:"Neon Green",color:"#64DD17",cap:null,group:"B"},
    {id:"f-bp",name:"BR Purple",color:"#8E24AA",cap:null,group:"B"},
    {id:"f-bg",name:"Bdn Green",color:"#2E7D32",cap:null,group:"B"},
    {id:"f-gy",name:"Gray",color:"#78909C",cap:null,group:"B"},
    {id:"f-sb",name:"Sky Blue",color:"#039BE5",cap:null,group:"B"},
  ];
  const tid = n => T.find(x=>x.name===n)?.id;
  const gm = (id,h,a,d,time,hs,as,phase) => ({id,h:tid(h),a:tid(a),date:d,time,loc:"James J Walker",hs,as,done:true,phase:phase||"group",videoUrl:""});
  const games = [
    gm("f1","Yellow","Orange","2025-09-07","10:50 AM",4,4),gm("f2","Bdn Green","Gold","2025-09-07","11:35 AM",2,8),gm("f3","Red","Black","2025-09-07","12:20 PM",0,4),gm("f4","Sky Blue","Gray","2025-09-07","1:05 PM",1,5),
    gm("f5","Gray","BR Purple","2025-09-13","9:00 AM",3,3),gm("f6","Gold","Neon Green","2025-09-13","1:00 PM",7,1),
    gm("f7","Black","AR Blue","2025-09-14","10:50 AM",5,5),gm("f8","Orange","Dark Purple","2025-09-14","11:35 AM",2,5),gm("f9","Yellow","Red","2025-09-14","12:20 PM",6,4),gm("f10","Bdn Green","Sky Blue","2025-09-14","1:05 PM",11,4),
    gm("f11","Orange","Red","2025-09-21","10:50 AM",8,7),gm("f12","Yellow","Black","2025-09-21","11:35 AM",1,4),gm("f13","Gold","Sky Blue","2025-09-21","12:20 PM",10,0),gm("f14","Bdn Green","Gray","2025-09-21","1:05 PM",5,1),
    gm("f15","Bdn Green","BR Purple","2025-09-28","10:50 AM",7,5),gm("f16","Sky Blue","Neon Green","2025-09-28","11:35 AM",2,7),gm("f17","Red","Dark Purple","2025-09-28","12:20 PM",4,9),gm("f18","Yellow","AR Blue","2025-09-28","1:05 PM",1,1),
    gm("f19","Gold","Gray","2025-10-05","10:50 AM",4,2),gm("f20","AR Blue","Dark Purple","2025-10-05","11:35 AM",3,6),gm("f21","Orange","Black","2025-10-05","12:20 PM",3,4),gm("f22","BR Purple","Neon Green","2025-10-05","1:05 PM",7,3),
    gm("f23","Yellow","Dark Purple","2025-10-12","10:50 AM",3,3),gm("f24","Bdn Green","Neon Green","2025-10-12","11:35 AM",2,7),gm("f25","Gold","BR Purple","2025-10-12","12:20 PM",0,5),gm("f26","Orange","AR Blue","2025-10-12","1:05 PM",0,3),
    gm("f27","Sky Blue","BR Purple","2025-10-19","10:50 AM",0,3),gm("f28","Black","Dark Purple","2025-10-19","11:35 AM",3,5),gm("f29","Gray","Neon Green","2025-10-19","12:20 PM",4,6),gm("f30","Red","AR Blue","2025-10-19","1:05 PM",8,14),
    gm("f31","Black","BR Purple","2025-10-26","10:50 AM",4,3),gm("f32","Dark Purple","Gold","2025-10-26","11:35 AM",3,0),gm("f33","AR Blue","Bdn Green","2025-10-26","12:20 PM",10,5),gm("f34","Yellow","Neon Green","2025-10-26","1:05 PM",5,6),
    gm("f35","Red","Gold","2025-11-02","10:50 AM",2,2),gm("f36","Orange","BR Purple","2025-11-02","11:35 AM",5,3),gm("f37","Dark Purple","Sky Blue","2025-11-02","12:20 PM",10,2),gm("f38","Black","Gray","2025-11-02","1:05 PM",4,1),
    gm("f39","AR Blue","Neon Green","2025-11-09","10:50 AM",8,4),gm("f40","Yellow","Bdn Green","2025-11-09","11:35 AM",12,2),gm("f41","Orange","Gray","2025-11-09","12:20 PM",2,3),gm("f42","Red","Sky Blue","2025-11-09","1:05 PM",5,2),
    gm("f43","Dark Purple","Bdn Green","2025-11-16","10:20 AM",7,3,"playoff"),gm("f44","Gold","Neon Green","2025-11-16","11:05 AM",8,7,"playoff"),gm("f45","Black","Yellow","2025-11-16","11:50 AM",8,6,"playoff"),gm("f46","AR Blue","BR Purple","2025-11-16","12:35 PM",8,1,"playoff"),
    gm("f47","AR Blue","Black","2025-11-23","10:50 AM",1,0,"playoff"),gm("f48","Gold","Dark Purple","2025-11-23","11:50 AM",1,0,"playoff"),
    gm("f49","AR Blue","Gold","2025-12-07","10:50 AM",1,0,"playoff"),
  ];
  return {id:"fall-2025",name:"Fall 2025",status:"completed",start:"2025-09-07",end:"2025-12-07",teams:T,games,groups:["A","B"],champion:"AR Blue"};
};

function DEFAULT() {
  const hist = historicalSeasons();
  return {
    adminPw: "admin2026",
    appUrl: "https://your-league-app.vercel.app",
    inviteTemplate: {subject:`You're Invited to ${BRAND}!`,body:`Hi!\n\nYou've been invited to join ${BRAND} as {{role}} of {{team}}.\n\nAccess the league app here: {{link}}\n\nSee you on the field!\n— ${BRAND}`},
    seasons: [
      ...hist, fall2025(),
      {id:"w25",name:"Winter 2025-2026",status:"active",start:"2025-12-06",end:"2026-03-08",groups:["A","B"],
        teams:[
          {id:"w25-ab",name:"AR Blue",color:"#1976D2",cap:null,group:"A"},
          {id:"w25-yl",name:"Yellow",color:"#F9A825",cap:null,group:"A"},
          {id:"w25-dp",name:"Dark Purple",color:"#7B1FA2",cap:null,group:"A"},
          {id:"w25-ng",name:"Neon Green",color:"#64DD17",cap:null,group:"A"},
          {id:"w25-or",name:"Orange",color:"#EF6C00",cap:null,group:"A"},
          {id:"w25-bk",name:"Black",color:"#212121",cap:null,group:"B"},
          {id:"w25-gd",name:"Gold",color:"#FF8F00",cap:null,group:"B"},
          {id:"w25-bp",name:"BR Purple",color:"#8E24AA",cap:null,group:"B"},
          {id:"w25-bg",name:"Bdn Green",color:"#2E7D32",cap:null,group:"B"},
          {id:"w25-gy",name:"Gray",color:"#78909C",cap:null,group:"B"}
        ],
        games:[
          {id:"w25-1",h:"w25-ng",a:"w25-dp",date:"2025-12-06",time:"10:20 AM",loc:"James J Walker",hs:2,as:9,done:true,phase:"group",videoUrl:""},
          {id:"w25-2",h:"w25-or",a:"w25-yl",date:"2025-12-06",time:"11:05 AM",loc:"James J Walker",hs:2,as:7,done:true,phase:"group",videoUrl:""},
          {id:"w25-3",h:"w25-gy",a:"w25-bk",date:"2025-12-06",time:"11:50 AM",loc:"James J Walker",hs:1,as:9,done:true,phase:"group",videoUrl:""},
          {id:"w25-4",h:"w25-bp",a:"w25-bg",date:"2025-12-07",time:"10:20 AM",loc:"James J Walker",hs:4,as:4,done:true,phase:"group",videoUrl:""},
          {id:"w25-5",h:"w25-ng",a:"w25-or",date:"2025-12-13",time:"10:20 AM",loc:"James J Walker",hs:5,as:3,done:true,phase:"group",videoUrl:""},
          {id:"w25-6",h:"w25-dp",a:"w25-ab",date:"2025-12-13",time:"11:05 AM",loc:"James J Walker",hs:3,as:8,done:true,phase:"group",videoUrl:""},
          {id:"w25-7",h:"w25-gy",a:"w25-bp",date:"2025-12-14",time:"10:20 AM",loc:"James J Walker",hs:4,as:7,done:true,phase:"group",videoUrl:""},
          {id:"w25-8",h:"w25-bk",a:"w25-gd",date:"2025-12-14",time:"11:05 AM",loc:"James J Walker",hs:0,as:3,done:true,phase:"group",videoUrl:""},
          {id:"w25-9",h:"w25-gy",a:"w25-gd",date:"2025-12-20",time:"10:20 AM",loc:"James J Walker",hs:0,as:3,done:true,phase:"group",videoUrl:""},
          {id:"w25-10",h:"w25-bk",a:"w25-bg",date:"2025-12-20",time:"11:05 AM",loc:"James J Walker",hs:4,as:1,done:true,phase:"group",videoUrl:""},
          {id:"w25-11",h:"w25-dp",a:"w25-yl",date:"2025-12-21",time:"10:20 AM",loc:"James J Walker",hs:1,as:5,done:true,phase:"group",videoUrl:""},
          {id:"w25-12",h:"w25-ng",a:"w25-ab",date:"2025-12-21",time:"11:05 AM",loc:"James J Walker",hs:6,as:8,done:true,phase:"group",videoUrl:""},
          {id:"w25-13",h:"w25-ng",a:"w25-yl",date:"2026-01-10",time:"10:20 AM",loc:"James J Walker",hs:6,as:7,done:true,phase:"group",videoUrl:""},
          {id:"w25-14",h:"w25-or",a:"w25-ab",date:"2026-01-10",time:"11:05 AM",loc:"James J Walker",hs:6,as:8,done:true,phase:"group",videoUrl:""},
          {id:"w25-15",h:"w25-gy",a:"w25-bg",date:"2026-01-11",time:"10:20 AM",loc:"James J Walker",hs:4,as:7,done:true,phase:"group",videoUrl:""},
          {id:"w25-16",h:"w25-bp",a:"w25-gd",date:"2026-01-11",time:"11:05 AM",loc:"James J Walker",hs:4,as:3,done:true,phase:"group",videoUrl:""},
          {id:"w25-17",h:"w25-dp",a:"w25-or",date:"2026-01-17",time:"10:20 AM",loc:"James J Walker",hs:0,as:3,done:true,phase:"group",videoUrl:""},
          {id:"w25-18",h:"w25-yl",a:"w25-ab",date:"2026-01-17",time:"11:05 AM",loc:"James J Walker",hs:3,as:10,done:true,phase:"group",videoUrl:""},
          {id:"w25-19",h:"w25-bg",a:"w25-gd",date:"2026-01-18",time:"10:20 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"group",videoUrl:""},
          {id:"w25-20",h:"w25-bk",a:"w25-bp",date:"2026-01-18",time:"11:05 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"group",videoUrl:""},
          {id:"w25-21",h:"w25-bg",a:"w25-gd",date:"2026-02-21",time:"10:20 AM",loc:"James J Walker",hs:2,as:2,done:true,phase:"group",videoUrl:""},
          {id:"w25-22",h:"w25-bk",a:"w25-bp",date:"2026-02-21",time:"11:05 AM",loc:"James J Walker",hs:4,as:2,done:true,phase:"group",videoUrl:""},
          {id:"w25-23",h:"w25-ng",a:"w25-gd",date:"2026-02-22",time:"8:50 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"group",videoUrl:""},
          {id:"w25-24",h:"w25-yl",a:"w25-bg",date:"2026-02-22",time:"9:35 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"group",videoUrl:""},
          {id:"w25-25",h:"w25-bp",a:"w25-dp",date:"2026-02-22",time:"10:20 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"group",videoUrl:""},
          {id:"w25-26",h:"w25-ab",a:"w25-gy",date:"2026-02-22",time:"11:05 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"group",videoUrl:""},
          {id:"w25-27",h:"w25-or",a:"w25-bk",date:"2026-02-22",time:"11:50 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"group",videoUrl:""},
          {id:"w25-28",h:"w25-bp",a:"w25-dp",date:"2026-02-28",time:"8:50 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"group",videoUrl:""},
          {id:"w25-29",h:"w25-or",a:"w25-gy",date:"2026-02-28",time:"9:35 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"group",videoUrl:""},
          {id:"w25-30",h:"w25-ab",a:"w25-bk",date:"2026-02-28",time:"10:20 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"group",videoUrl:""},
          {id:"w25-31",h:"w25-yl",a:"w25-gd",date:"2026-02-28",time:"11:05 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"group",videoUrl:""},
          {id:"w25-32",h:"w25-bg",a:"w25-ng",date:"2026-02-28",time:"11:50 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"group",videoUrl:""},
          {id:"w25-qf1",h:"",a:"",date:"2026-03-01",time:"9:20 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"playoff",videoUrl:""},
          {id:"w25-qf2",h:"",a:"",date:"2026-03-01",time:"10:05 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"playoff",videoUrl:""},
          {id:"w25-qf3",h:"",a:"",date:"2026-03-01",time:"10:50 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"playoff",videoUrl:""},
          {id:"w25-qf4",h:"",a:"",date:"2026-03-01",time:"11:35 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"playoff",videoUrl:""},
          {id:"w25-sf1",h:"",a:"",date:"2026-03-07",time:"10:20 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"playoff",videoUrl:""},
          {id:"w25-sf2",h:"",a:"",date:"2026-03-07",time:"11:05 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"playoff",videoUrl:""},
          {id:"w25-final",h:"",a:"",date:"2026-03-08",time:"10:20 AM",loc:"James J Walker",hs:null,as:null,done:false,phase:"playoff",videoUrl:""}
        ]
      }
    ],
    invites:[],
    rules:`${BRAND} — League Rules\n\n1. All games are 11v11 format\n2. Two 35-minute halves\n3. 3 points for a win, 1 point for a draw, 0 for a loss\n4. Tiebreakers: Points → Goal Differential → Head-to-Head\n5. Yellow card accumulation: 3 yellows = 1 game suspension\n6. Red card = automatic 1 game suspension (minimum)\n7. Teams must have minimum 11 players on roster\n8. Game time is forfeit time — no grace period\n9. Home team provides game ball\n10. All players must have valid ID at games`
  };
};

const calcStandings = (season, group) => {
  const ids = new Set(season.teams.filter(t => !group || t.group === group).map(t => t.id));
  const st = {};
  season.teams.filter(t => ids.has(t.id)).forEach(t => { st[t.id] = {team:t,w:0,d:0,l:0,gf:0,ga:0,pts:0,gd:0,p:0,h2h:{}}; });
  season.games.filter(g => g.done && (g.phase||"group") === "group" && (ids.has(g.h) || ids.has(g.a))).forEach(g => {
    const h=st[g.h], a=st[g.a];
    if(h){h.gf+=g.hs; h.ga+=g.as; h.p++;}
    if(a){a.gf+=g.as; a.ga+=g.hs; a.p++;}
    if(g.hs>g.as){if(h){h.w++;h.pts+=3;} if(a){a.l++;}} else if(g.hs<g.as){if(a){a.w++;a.pts+=3;} if(h){h.l++;}} else{if(h){h.d++;h.pts++;} if(a){a.d++;a.pts++;}}
    if(h&&a){if(!h.h2h[g.a])h.h2h[g.a]=0; if(!a.h2h[g.h])a.h2h[g.h]=0;
    if(g.hs>g.as)h.h2h[g.a]+=3; else if(g.hs<g.as)a.h2h[g.h]+=3; else{h.h2h[g.a]++;a.h2h[g.h]++;}}
  });
  Object.values(st).forEach(s=>{s.gd=s.gf-s.ga;});
  return Object.values(st).sort((a,b)=> b.pts!==a.pts?b.pts-a.pts : b.gd!==a.gd?b.gd-a.gd : (b.h2h[a.team.id]||0)-(a.h2h[b.team.id]||0));
};

const timeToMin = t => { if(!t) return 0; const m=t.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/); if(!m) return 0; let h=parseInt(m[1]),mn=parseInt(m[2]); const ap=(m[3]||"").toUpperCase(); if(ap==="PM"&&h!==12)h+=12; if(ap==="AM"&&h===12)h=0; return h*60+mn; };
const sortGames = g => [...g].sort((a,b)=>{ const dd=new Date(a.date)-new Date(b.date); return dd!==0?dd:timeToMin(a.time)-timeToMin(b.time); });

const I = ({n,s=20}) => {
  const d={trophy:<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18M9 22h6m-3-7v7m-5-11a5 5 0 0 0 10 0V3H7v8Z"/>,cal:<><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4m-5 4h18"/></>,pin:<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,users:<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87m-3-12a4 4 0 0 1 0 7.75"/></>,mail:<><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,plus:<path d="M12 5v14m-7-7h14"/>,edit:<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>,trash:<><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,check:<path d="M20 6 9 17l-5-5"/>,x:<path d="M18 6 6 18M6 6l12 12"/>,book:<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>,send:<path d="m22 2-7 20-4-9-9-4Z"/>,out:<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,upload:<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,settings:<><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>,dl:<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,video:<><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2"/></>};
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d[n]}</svg>;
};

const selOptStyle = `select option{background:#1a1f2e;color:#e8ecf4;}`;
const selSt = {width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"#e8ecf4",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none"};
const Modal = ({open,onClose,title,children}) => { if(!open) return null; return <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)",padding:16}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:"#1a1f2e",borderRadius:16,padding:28,width:"100%",maxWidth:520,maxHeight:"85vh",overflow:"auto",border:"1px solid rgba(255,255,255,0.08)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h3 style={{margin:0,fontSize:18,color:"#fff",fontFamily:"'DM Sans',sans-serif"}}>{title}</h3><button onClick={onClose} style={{background:"none",border:"none",color:"#8892a4",cursor:"pointer"}}><I n="x" s={18}/></button></div>{children}</div></div>; };
const Btn = ({children,onClick,v="primary",sz="md",icon,disabled,style:sx,...r}) => { const base={display:"inline-flex",alignItems:"center",gap:6,border:"none",borderRadius:10,cursor:disabled?"default":"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,opacity:disabled?0.5:1}; const sizes={sm:{padding:"6px 12px",fontSize:13},md:{padding:"10px 18px",fontSize:14}}; const vars={primary:{background:"linear-gradient(135deg,#00C896,#00A67E)",color:"#fff"},secondary:{background:"rgba(255,255,255,0.06)",color:"#c8d0e0",border:"1px solid rgba(255,255,255,0.1)"},danger:{background:"rgba(230,57,70,0.15)",color:"#E63946"},ghost:{background:"transparent",color:"#8892a4"}}; return <button disabled={disabled} onClick={onClick} style={{...base,...sizes[sz],...vars[v],...sx}} {...r}>{icon&&<I n={icon} s={sz==="sm"?14:16}/>}{children}</button>; };
const Inp = ({label,value,onChange,type="text",ph,ta}) => (<div style={{marginBottom:14}}>{label&&<label style={{display:"block",fontSize:12,color:"#8892a4",marginBottom:5,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif"}}>{label}</label>}{ta?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} rows={5} style={{width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"#e8ecf4",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>:<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} style={{width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"#e8ecf4",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"}}/>}</div>);
const Sel = ({label,value,onChange,opts}) => (<div style={{marginBottom:14}}><label style={{display:"block",fontSize:12,color:"#8892a4",marginBottom:5,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif"}}>{label}</label><select value={value} onChange={e=>onChange(e.target.value)} style={selSt}><option value="">Select...</option>{opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select></div>);
const Badge = ({children,c="#00C896"}) => <span style={{display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:`${c}20`,color:c,textTransform:"uppercase"}}>{children}</span>;
const Card = ({children,style:sx,onClick}) => <div onClick={onClick} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:20,cursor:onClick?"pointer":"default",...sx}}>{children}</div>;
const fmtDate = d => new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});

const StandingsTable = ({rows,title}) => (<div style={{marginBottom:24}}>{title&&<h3 style={{fontSize:16,margin:"0 0 12px",color:"#e8ecf4",fontFamily:"'Bricolage Grotesque',sans-serif"}}>{title}</h3>}<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}><thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>{["#","Team","P","W","D","L","GF","GA","GD","PTS"].map(h=><th key={h} style={{padding:"10px 8px",textAlign:h==="Team"?"left":"center",color:"#8892a4",fontWeight:600,fontSize:11,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead><tbody>{rows.map((s,i)=><tr key={s.team.id} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}><td style={{padding:"12px 8px",textAlign:"center",color:i<1?"#00C896":"#8892a4",fontWeight:700}}>{i+1}</td><td style={{padding:"12px 8px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:s.team.color,flexShrink:0}}/><span style={{color:"#e8ecf4",fontWeight:600,whiteSpace:"nowrap"}}>{s.team.name}</span></div></td>{[s.p,s.w,s.d,s.l,s.gf,s.ga].map((v,j)=><td key={j} style={{padding:"12px 8px",textAlign:"center",color:"#a0a8b8"}}>{v}</td>)}<td style={{padding:"12px 8px",textAlign:"center",color:s.gd>0?"#00C896":s.gd<0?"#E63946":"#a0a8b8",fontWeight:600}}>{s.gd>0?`+${s.gd}`:s.gd}</td><td style={{padding:"12px 8px",textAlign:"center",color:"#fff",fontWeight:700,fontSize:15}}>{s.pts}</td></tr>)}</tbody></table></div></div>);

// Season selector component

const ChampTally = ({seasons, adminView}) => {
  const counts = {};
  const recent = [];
  const completed = seasons.filter(s => s.status === "completed" && s.champion).sort((a,b) => new Date(b.end) - new Date(a.end));
  completed.forEach(s => {
    counts[s.champion] = (counts[s.champion] || 0) + 1;
    if (recent.length < 4) recent.push({season: s.name, champion: s.champion});
  });
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
  if (adminView) {
    return <Card style={{marginBottom:16}}>
      <div style={{fontSize:14,fontWeight:700,color:"#FFB300",marginBottom:12}}>🏆 All-Time Championship Wins</div>
      {sorted.map(([name,ct]) => <div key={name} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
        <span style={{color:"#e8ecf4",fontWeight:600}}>{name}</span>
        <span style={{color:"#FFB300",fontWeight:700}}>{ct}{" title"}{ct>1?"s":""}</span>
      </div>)}
    </Card>;
  }
  return <Card style={{marginBottom:16}}>
    <div style={{fontSize:14,fontWeight:700,color:"#FFB300",marginBottom:12}}>🏆 Recent Champions</div>
    {recent.map((r,i) => <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
      <span style={{color:"#8892a4",fontSize:13}}>{r.season}</span>
      <span style={{color:"#e8ecf4",fontWeight:600,fontSize:13}}>{r.champion}</span>
    </div>)}
  </Card>;
};

const SeasonPicker = ({seasons,current,onSelect,admin,onStatus,onDelete}) => {
  const active = seasons.filter(s => s.status === "active");
  const completed = seasons.filter(s => s.status === "completed").sort((a,b) => new Date(b.end) - new Date(a.end));
  const planning = seasons.filter(s => s.status === "planning");
  const StatusBtns = ({s}) => {
    if(!admin) return null;
    return <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}} onClick={e=>e.stopPropagation()}>
      {s.status==="planning"&&<Btn sz="sm" v="secondary" onClick={()=>onStatus(s.id,"active")}>Activate</Btn>}
      {s.status==="active"&&<Btn sz="sm" v="secondary" onClick={()=>{const finalGame=s.games.filter(g=>g.phase==="playoff"&&g.round==="final"&&g.done)[0];let champ="";if(finalGame){const winner=finalGame.pks?(finalGame.pkh>finalGame.pka?finalGame.h:finalGame.a):(finalGame.hs>finalGame.as?finalGame.h:finalGame.a);const team=s.teams.find(t=>t.id===winner);champ=team?.name||"";}const name=prompt("Champion team name:",champ);if(name!==null)onStatus(s.id,"completed",name);}}>Complete</Btn>}
      {s.status==="completed"&&<Btn sz="sm" v="secondary" onClick={()=>onStatus(s.id,"active")}>Reopen</Btn>}
      <Btn sz="sm" v="danger" icon="trash" onClick={()=>onDelete(s.id)}/>
    </div>;
  };
  const SCard = ({s,bc}) => <Card key={s.id} onClick={()=>onSelect(s.id)} style={{marginBottom:8,cursor:"pointer",border:current===s.id?`2px solid ${bc}`:"1px solid rgba(255,255,255,0.06)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
      <div><span style={{color:"#e8ecf4",fontWeight:700,fontSize:15}}>{s.name}</span><span style={{color:"#8892a4",fontSize:12,marginLeft:8}}>{s.teams.length} teams</span>{s.champion&&<span style={{color:"#FFB300",fontSize:12,marginLeft:8}}>🏆 {s.champion}</span>}</div>
      <Badge c={bc}>{s.status}</Badge>
    </div>
    <StatusBtns s={s}/>
  </Card>;
  return <div style={{marginBottom:20}}>
    {active.length > 0 && <><div style={{fontSize:12,color:"#00C896",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Active</div>{active.map(s => <SCard key={s.id} s={s} bc="#00C896"/>)}</>}
    {planning.length > 0 && <><div style={{fontSize:12,color:"#F4A261",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,marginTop:16}}>Planning</div>{planning.map(s => <SCard key={s.id} s={s} bc="#F4A261"/>)}</>}
    {completed.length > 0 && <><div style={{fontSize:12,color:"#8892a4",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,marginTop:16}}>Completed</div>{completed.map(s => <SCard key={s.id} s={s} bc="#8892a4"/>)}</>}
  </div>;
};

const ExcelUploadGames = ({season,onImport}) => {
  const fr=useRef(null);const[pv,setPv]=useState(null);const[er,setEr]=useState("");const[mp,setMp]=useState({home:"",away:"",date:"",time:"",location:"",phase:""});
  const handle=e=>{const f=e.target.files[0];if(!f)return;setEr("");const r=new FileReader();r.onload=ev=>{try{const wb=XLSX.read(ev.target.result,{type:"array",cellDates:true});const ws=wb.Sheets[wb.SheetNames[0]];const j=XLSX.utils.sheet_to_json(ws,{defval:""});if(!j.length){setEr("No data");return;}const c=Object.keys(j[0]);const am={home:"",away:"",date:"",time:"",location:"",phase:""};c.forEach(x=>{const l=x.toLowerCase();if(l.includes("home")&&!am.home)am.home=x;else if(l.includes("away")||l.includes("visitor"))am.away=x;else if(l.includes("date"))am.date=x;else if(l.includes("time"))am.time=x;else if(l.includes("loc")||l.includes("field")||l.includes("venue"))am.location=x;else if(l.includes("phase")||l.includes("round"))am.phase=x;});setMp(am);setPv({rows:j,cols:c});}catch{setEr("Could not read file.");}};r.readAsArrayBuffer(f);};
  const imp=()=>{if(!pv||!mp.home||!mp.away||!mp.date)return;const tn={};season.teams.forEach(t=>{tn[t.name.toLowerCase().trim()]=t.id;});const gs=[],es=[];pv.rows.forEach((row,i)=>{const hn=String(row[mp.home]||"").trim(),an=String(row[mp.away]||"").trim();const hid=tn[hn.toLowerCase()],aid=tn[an.toLowerCase()];if(!hid)es.push(`Row ${i+2}: "${hn}" not found`);if(!aid)es.push(`Row ${i+2}: "${an}" not found`);let ds="";const rd=row[mp.date];if(rd instanceof Date)ds=rd.toISOString().split("T")[0];else{const p=new Date(rd);if(!isNaN(p))ds=p.toISOString().split("T")[0];else{const parts=String(rd).split("/");if(parts.length===3){const[m,d2,y]=parts;const p2=new Date(y+"-"+(m.padStart(2,"0"))+"-"+(d2.padStart(2,"0")));if(!isNaN(p2))ds=p2.toISOString().split("T")[0];else es.push(`Row ${i+2}: Bad date`);}else es.push(`Row ${i+2}: Bad date`);}}const ph=mp.phase?String(row[mp.phase]||"").trim().toLowerCase():"";const phase=(ph.includes("play")||ph.includes("semi")||ph.includes("final")||ph.includes("quarter"))?"playoff":"group";if(hid&&aid&&ds)gs.push({id:`gi${Date.now()}-${i}`,h:hid,a:aid,date:ds,time:String(row[mp.time]||"").trim(),loc:String(row[mp.location]||"").trim(),hs:null,as:null,done:false,phase,videoUrl:""});});if(es.length&&!gs.length){setEr(es.join("\n"));return;}onImport(gs,es);setPv(null);if(fr.current)fr.current.value="";};
  const dl=()=>{const n=season.teams.map(t=>t.name);const d=[["Home Team","Away Team","Date","Time","Location","Phase"]];if(n.length>=2){d.push([n[0],n[1],"2026-03-07","10:00 AM","Field A","group"]);d.push([n[2]||n[0],n[3]||n[1],"2026-03-07","12:00 PM","Field B","group"]);}const wb=XLSX.utils.book_new();const ws=XLSX.utils.aoa_to_sheet(d);ws["!cols"]=[{wch:20},{wch:20},{wch:14},{wch:12},{wch:16},{wch:10}];XLSX.utils.book_append_sheet(wb,ws,"Schedule");const r=[["Team Names"],...n.map(x=>[x])];XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(r),"Teams");XLSX.writeFile(wb,"schedule-template.xlsx");};
  return <Card style={{marginBottom:16,border:"1px dashed rgba(0,200,150,0.3)",background:"rgba(0,200,150,0.02)"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><I n="upload" s={18}/><div><div style={{color:"#e8ecf4",fontWeight:700,fontSize:14}}>Bulk Import Games</div><div style={{color:"#8892a4",fontSize:12}}>Upload Excel/CSV. Phase column for playoffs.</div></div></div>
    <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}><Btn sz="sm" v="secondary" icon="dl" onClick={dl}>Template</Btn><label style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",fontSize:13,fontWeight:600,borderRadius:10,background:"linear-gradient(135deg,#00C896,#00A67E)",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><I n="upload" s={14}/>Upload<input ref={fr} type="file" accept=".xlsx,.xls,.csv" onChange={handle} style={{display:"none"}}/></label></div>
    {er&&<div style={{background:"rgba(230,57,70,0.1)",borderRadius:10,padding:12,marginBottom:12}}><pre style={{color:"#E63946",fontSize:12,margin:0,whiteSpace:"pre-wrap"}}>{er}</pre></div>}
    {pv&&<div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>{[{k:"home",l:"Home *"},{k:"away",l:"Away *"},{k:"date",l:"Date *"},{k:"time",l:"Time"},{k:"location",l:"Location"},{k:"phase",l:"Phase"}].map(f=><Sel key={f.k} label={f.l} value={mp[f.k]} onChange={v=>setMp({...mp,[f.k]:v})} opts={pv.cols.map(c=>({v:c,l:c}))}/>)}</div><div style={{display:"flex",gap:8}}><Btn sz="sm" onClick={imp} disabled={!mp.home||!mp.away||!mp.date}>Import {pv.rows.length} Games</Btn><Btn sz="sm" v="secondary" onClick={()=>{setPv(null);if(fr.current)fr.current.value="";}}>Cancel</Btn></div></div>}
  </Card>;
};

const ExcelUploadTeams = ({onImport,existingNames}) => {
  const fr=useRef(null);const[pv,setPv]=useState(null);const[er,setEr]=useState("");const[mp,setMp]=useState({name:"",capName:"",capEmail:"",group:""});
  const handle=e=>{const f=e.target.files[0];if(!f)return;setEr("");const r=new FileReader();r.onload=ev=>{try{const wb=XLSX.read(ev.target.result,{type:"array"});const ws=wb.Sheets[wb.SheetNames[0]];const j=XLSX.utils.sheet_to_json(ws,{defval:""});if(!j.length){setEr("No data");return;}const c=Object.keys(j[0]);const am={name:"",capName:"",capEmail:"",group:""};c.forEach(x=>{const l=x.toLowerCase();if((l.includes("team")||l==="name")&&!am.name)am.name=x;else if(l.includes("captain")&&!am.capName)am.capName=x;else if(l.includes("email"))am.capEmail=x;else if(l.includes("group"))am.group=x;});setMp(am);setPv({rows:j,cols:c});}catch{setEr("Could not read file.");}};r.readAsArrayBuffer(f);};
  const imp=()=>{if(!pv||!mp.name)return;const ex=new Set(existingNames.map(n=>n.toLowerCase()));const ts=[],es=[];pv.rows.forEach((row,i)=>{const nm=String(row[mp.name]||"").trim();if(!nm){es.push(`Row ${i+2}: No name`);return;}if(ex.has(nm.toLowerCase())){es.push(`Row ${i+2}: "${nm}" exists`);return;}ex.add(nm.toLowerCase());const cn=mp.capName?String(row[mp.capName]||"").trim():"";const ce=mp.capEmail?String(row[mp.capEmail]||"").trim():"";const gr=mp.group?String(row[mp.group]||"A").trim().toUpperCase():"A";ts.push({id:`t${Date.now()}-${i}`,name:nm,color:teamColor(nm),cap:cn?{name:cn,email:ce}:null,group:gr});});if(es.length&&!ts.length){setEr(es.join("\n"));return;}onImport(ts,es);setPv(null);if(fr.current)fr.current.value="";};
  const dl=()=>{const d=[["Team Name","Captain Name","Captain Email","Group"],["FC Example","John Doe","john@email.com","A"],["United SC","Jane Smith","jane@email.com","B"]];const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(d),"Teams");XLSX.writeFile(wb,"teams-template.xlsx");};
  return <Card style={{marginBottom:16,border:"1px dashed rgba(69,123,157,0.4)",background:"rgba(69,123,157,0.02)"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><I n="upload" s={18}/><div><div style={{color:"#e8ecf4",fontWeight:700,fontSize:14}}>Bulk Import Teams</div><div style={{color:"#8892a4",fontSize:12}}>Include Group column (A or B)</div></div></div>
    <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}><Btn sz="sm" v="secondary" icon="dl" onClick={dl}>Template</Btn><label style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",fontSize:13,fontWeight:600,borderRadius:10,background:"linear-gradient(135deg,#457B9D,#2A6F97)",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><I n="upload" s={14}/>Upload<input ref={fr} type="file" accept=".xlsx,.xls,.csv" onChange={handle} style={{display:"none"}}/></label></div>
    {er&&<div style={{background:"rgba(230,57,70,0.1)",borderRadius:10,padding:12,marginBottom:12}}><pre style={{color:"#E63946",fontSize:12,margin:0,whiteSpace:"pre-wrap"}}>{er}</pre></div>}
    {pv&&<div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>{[{k:"name",l:"Team Name *"},{k:"capName",l:"Captain"},{k:"capEmail",l:"Email"},{k:"group",l:"Group"}].map(f=><Sel key={f.k} label={f.l} value={mp[f.k]} onChange={v=>setMp({...mp,[f.k]:v})} opts={pv.cols.map(c=>({v:c,l:c}))}/>)}</div><div style={{display:"flex",gap:8}}><Btn sz="sm" onClick={imp} disabled={!mp.name}>Import {pv.rows.length} Teams</Btn><Btn sz="sm" v="secondary" onClick={()=>{setPv(null);if(fr.current)fr.current.value="";}}>Cancel</Btn></div></div>}
  </Card>;
};


export default function App() {
  const [data,setData]=useState(null);const[loading,setLoading]=useState(true);const[role,setRole]=useState(null);
  const[pw,setPw]=useState("");const[err,setErr]=useState("");const[tab,setTab]=useState("standings");
  const[selSeason,setSelSeason]=useState(null);const[modal,setModal]=useState(null);const[form,setForm]=useState({});const[msg,setMsg]=useState("");const[teamFilter,setTeamFilter]=useState("");

  const [loadError,setLoadError]=useState(null);const [dbReady,setDbReady]=useState(false);
  useEffect(()=>{(async()=>{const defaults=DEFAULT();const result=await loadData();if(result.status==="ok"){const s=result.data;const histIds=new Set(defaults.seasons.filter(x=>x.status==="completed").map(x=>x.id));const activeSaved=s.seasons.filter(x=>!histIds.has(x.id));const histFromCode=defaults.seasons.filter(x=>x.status==="completed");setData({...s,seasons:[...histFromCode,...activeSaved]});setDbReady(true);}else if(result.status==="empty"){setData(defaults);setDbReady(true);}else{setLoadError(result.msg||"Could not connect to database");setData(defaults);}setLoading(false);})();},[]);

  const season=data?.seasons.find(s=>s.id===selSeason)||data?.seasons.find(s=>s.status==="active")||data?.seasons[0];
  const upd=fn=>{if(!dbReady){flash("⚠ Database not connected. Changes not saved.");return;}const scrollY=window.scrollY;const u=fn(data);setData(u);saveData(u).then(()=>console.log("Saved to Supabase at",new Date().toISOString()));setTimeout(()=>window.scrollTo(0,scrollY),50);};
  const updSeason=fn=>upd(d=>({...d,seasons:d.seasons.map(s=>s.id===season.id?fn(s):s)}));
  const gmailCompose=(to,su,bo)=>window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(su)}&body=${encodeURIComponent(bo)}`,"_blank");
  const buildInvite=(em,tn,rl)=>{const t=data.inviteTemplate||{subject:"",body:""};return{subj:t.subject,body:t.body.replace(/\{\{role\}\}/g,rl||"member").replace(/\{\{team\}\}/g,tn||"the league").replace(/\{\{link\}\}/g,data.appUrl||"")};};
  const flash=(m,ms=6000)=>{setMsg(m);setTimeout(()=>setMsg(""),ms);};
  const exportInvites=()=>{const d=[["Email","Team","Role","Status","Sent"],...data.invites.map(i=>[i.email,i.team,i.role,i.status,i.sent])];const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(d),"Invites");XLSX.writeFile(wb,"invites.xlsx");};

  if(loading) return <div style={{minHeight:"100vh",background:"#0d1117",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#00C896",fontSize:18}}>Loading...</div></div>;
  if(!role) return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0d1117 0%,#131a24 50%,#0d1117 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
    <style>{selOptStyle}</style><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <div style={{textAlign:"center",maxWidth:400,width:"100%"}}><div style={{marginBottom:40}}><div style={{width:72,height:72,borderRadius:20,background:"linear-gradient(135deg,#00C896,#00A67E)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><span style={{fontSize:36}}>⚽</span></div><h1 style={{fontSize:28,fontWeight:800,color:"#fff",margin:"0 0 4px",fontFamily:"'Bricolage Grotesque',sans-serif"}}>{BRAND}</h1><p style={{color:"#8892a4",fontSize:14,margin:0}}>League Management</p></div>
    <Card style={{marginBottom:12,textAlign:"left",border:"1px solid rgba(0,200,150,0.2)",background:"rgba(0,200,150,0.04)"}}><div style={{fontSize:13,fontWeight:700,color:"#00C896",textTransform:"uppercase",marginBottom:14}}>Player Access</div><p style={{color:"#8892a4",fontSize:13,margin:"0 0 14px"}}>View schedules, standings, and league rules.</p><Btn onClick={()=>{setRole("player");setTab("seasons");}} style={{width:"100%"}}>Enter League</Btn></Card>
    <Card style={{textAlign:"left"}}><div style={{fontSize:13,fontWeight:700,color:"#8892a4",textTransform:"uppercase",marginBottom:14}}>Admin Login</div><Inp label="Password" type="password" value={pw} onChange={v=>{setPw(v);setErr("");}} ph="Enter admin password"/>{err&&<div style={{color:"#E63946",fontSize:12,marginBottom:8}}>{err}</div>}<Btn v="secondary" onClick={()=>{if(pw===data.adminPw){setRole("admin");setErr("");setTab("seasons");}else setErr("Incorrect password");}} style={{width:"100%"}}>Sign In as Admin</Btn></Card></div></div>;

  const isAdmin=role==="admin";
  const hasPlayoffs=season?.games.some(g=>g.phase==="playoff"&&g.h);
  const tabs=isAdmin?[{id:"seasons",label:"Seasons",icon:"trophy"},{id:"teams",label:"Teams",icon:"users"},hasPlayoffs&&{id:"bracket",label:"Playoffs",icon:"trophy"},{id:"schedule",label:"Schedule",icon:"cal"},{id:"standings",label:"Standings",icon:"trophy"},{id:"invites",label:"Invites",icon:"mail"},{id:"email",label:"Email",icon:"send"},{id:"rules",label:"Rules",icon:"book"},{id:"settings",label:"Settings",icon:"settings"}].filter(Boolean)
    :[{id:"seasons",label:"Seasons",icon:"trophy"},{id:"standings",label:"Standings",icon:"trophy"},hasPlayoffs&&{id:"bracket",label:"Playoffs",icon:"trophy"},{id:"schedule",label:"Schedule",icon:"cal"},{id:"rules",label:"Rules",icon:"book"}].filter(Boolean);
  const teamOpts=season?.teams.map(t=>({v:t.id,l:t.name}))||[];
  const tm={}; season?.teams.forEach(t=>{tm[t.id]=t;});

  const GameCard = ({g,admin}) => {
    const ho=tm[g.h],aw=tm[g.a]; if(!ho||!aw) return null;
    return <Card style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:12,color:"#8892a4",display:"flex",alignItems:"center",gap:6}}><I n="cal" s={14}/>{fmtDate(g.date)} · {g.time}</div>
        <div style={{display:"flex",gap:6}}>{g.phase==="playoff"&&<Badge c="#FFB300">Playoff</Badge>}{g.done?<Badge c="#00C896">Final</Badge>:<Badge c="#F4A261">Upcoming</Badge>}</div>
      </div>
      {g.loc&&<div style={{fontSize:12,color:"#a0a8b8",display:"flex",alignItems:"center",gap:5,marginTop:4}}><I n="pin" s={13}/>{g.loc}{g.duration&&<span style={{color:"#8892a4"}}> · {g.duration} min</span>}</div>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginTop:14,fontSize:15,fontWeight:600,color:"#e8ecf4"}}>{(()=>{const hWin=g.done&&(g.hs>g.as||(g.pks&&g.pkh>g.pka));const aWin=g.done&&(g.as>g.hs||(g.pks&&g.pka>g.pkh));return<>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,justifyContent:"flex-end"}}><span style={{color:hWin?"#00C896":"#e8ecf4"}}>{ho.name}</span><div style={{width:12,height:12,borderRadius:"50%",background:ho.color}}/></div>
        {g.done?<div style={{padding:"4px 14px",borderRadius:8,background:"rgba(255,255,255,0.06)",fontWeight:700,fontSize:18,fontFamily:"'Bricolage Grotesque',sans-serif",minWidth:60,textAlign:"center"}}>{g.hs} – {g.as}{g.forfeit&&<span style={{color:"#E63946",fontSize:11,fontWeight:600,marginLeft:6}}>(F)</span>}{g.pks&&<div style={{fontSize:11,color:"#FFB300",fontWeight:600,marginTop:2}}>({g.pkh}–{g.pka} PKs)</div>}</div>:<div style={{padding:"4px 14px",borderRadius:8,background:"rgba(255,255,255,0.04)",color:"#8892a4",fontSize:13}}>vs</div>}
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}><div style={{width:12,height:12,borderRadius:"50%",background:aw.color}}/><span style={{color:aWin?"#00C896":"#e8ecf4"}}>{aw.name}</span></div>
      </>;})()}</div>
      {g.videoUrl&&<div style={{textAlign:"center",marginTop:8}}><a href={g.videoUrl} target="_blank" rel="noopener noreferrer" style={{color:"#03A9F4",fontSize:12,display:"inline-flex",alignItems:"center",gap:4}}><I n="video" s={14}/>Watch Game</a></div>}
      {admin&&<div style={{display:"flex",gap:6,marginTop:12,justifyContent:"center",flexWrap:"wrap"}}>
        {!g.done&&<Btn sz="sm" icon="check" onClick={()=>{setForm({gid:g.id,hs:"",as:"",h:g.h,a:g.a,videoUrl:g.videoUrl||""});setModal("score");}}>Score</Btn>}
        {g.done&&<Btn sz="sm" v="secondary" icon="edit" onClick={()=>{setForm({gid:g.id,hs:String(g.hs),as:String(g.as),h:g.h,a:g.a,videoUrl:g.videoUrl||"",forfeit:!!g.forfeit,pks:!!g.pks,pkh:g.pkh!=null?String(g.pkh):"",pka:g.pka!=null?String(g.pka):""});setModal("score");}}>Edit Score</Btn>}
        <Btn sz="sm" v="secondary" icon="edit" onClick={()=>{setForm({gid:g.id,h:g.h,a:g.a,date:g.date,time:g.time,loc:g.loc,duration:g.duration?String(g.duration):"",phase:g.phase||"group",round:g.round||""});setModal("editGame");}}>Edit</Btn>
        <Btn sz="sm" v="secondary" icon="video" onClick={()=>{setForm({gid:g.id,videoUrl:g.videoUrl||""});setModal("video");}}>Video</Btn>
        <Btn sz="sm" v="danger" icon="trash" onClick={()=>{updSeason(s=>({...s,games:s.games.filter(x=>x.id!==g.id)}));}}>Del</Btn>
      </div>}
    </Card>;
  };

  return <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0d1117 0%,#131a24 50%,#0d1117 100%)",fontFamily:"'DM Sans',sans-serif"}}>
    <style>{selOptStyle}</style><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
    <div style={{background:"rgba(13,17,23,0.9)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#00C896,#00A67E)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚽</div><div><div style={{fontSize:14,fontWeight:700,color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif"}}>{BRAND}</div><div style={{fontSize:11,color:"#8892a4"}}>{isAdmin?"Admin":"Player"}{season?` · ${season.name}`:""}</div></div></div>
      <Btn sz="sm" v="ghost" icon="out" onClick={()=>{setRole(null);setPw("");}}>Logout</Btn>
    </div>
    <div style={{padding:"8px 12px",overflowX:"auto",display:"flex",gap:4,borderBottom:"1px solid rgba(255,255,255,0.04)",background:"rgba(13,17,23,0.5)"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",background:tab===t.id?"rgba(0,200,150,0.12)":"transparent",color:tab===t.id?"#00C896":"#8892a4"}}><I n={t.icon} s={15}/>{t.label}</button>)}
    </div>
    {loadError&&<div style={{margin:"12px 20px 0",background:"rgba(230,57,70,0.15)",borderRadius:10,padding:14,border:"1px solid rgba(230,57,70,0.4)"}}><div style={{color:"#E63946",fontSize:14,fontWeight:700}}>⚠ Database Offline</div><div style={{color:"#E63946",fontSize:12,marginTop:4}}>Live data unavailable. Showing default data only. Admin changes are disabled.</div><div style={{marginTop:8}}><Btn sz="sm" v="danger" onClick={()=>window.location.reload()}>Retry Connection</Btn></div></div>}
    {msg&&<div style={{margin:"12px 20px 0",background:"rgba(0,200,150,0.1)",borderRadius:10,padding:12}}><div style={{color:"#00C896",fontSize:12}}>{msg}</div></div>}
    <div style={{padding:20,maxWidth:900,margin:"0 auto"}}>

      {tab==="seasons"&&<div>
        <h2 style={{fontSize:20,margin:"0 0 16px",color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif"}}>Seasons</h2>
        {isAdmin&&<div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><Btn icon="plus" sz="sm" onClick={()=>{setForm({name:"",start:"",end:""});setModal("newSeason");}}>New Season</Btn></div>}
        <ChampTally seasons={data.seasons} adminView={isAdmin}/>
        <SeasonPicker seasons={data.seasons} current={season?.id} onSelect={id=>{setSelSeason(id);setTab("standings");setTeamFilter("");}} admin={isAdmin} onStatus={(id,st,champ)=>upd(d=>({...d,seasons:d.seasons.map(x=>x.id===id?{...x,status:st,...(champ!==undefined?{champion:champ}:{})}:x)}))} onDelete={id=>{upd(d=>({...d,seasons:d.seasons.filter(x=>x.id!==id)}));}}/>
      </div>}

      {tab==="standings"&&season&&<div>
        <h2 style={{fontSize:20,margin:"0 0 16px",color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif"}}>Standings — {season.name}</h2>
        {season.champion&&<Card style={{marginBottom:16,border:"1px solid rgba(0,200,150,0.3)",background:"rgba(0,200,150,0.04)",textAlign:"center"}}><div style={{fontSize:13,color:"#8892a4",marginBottom:4}}>🏆 Champion</div><div style={{fontSize:18,fontWeight:700,color:"#00C896",fontFamily:"'Bricolage Grotesque',sans-serif"}}>{season.champion}</div></Card>}
        {(season.groups||[]).length>1?(season.groups||[]).map(g=> <StandingsTable key={g} rows={calcStandings(season,g)} title={`Group ${g}`}/>)
        :<StandingsTable rows={calcStandings(season,null)}/>}
        {isAdmin&&season.status!=="completed"&&<div style={{marginTop:20,textAlign:"center"}}><Btn icon="trophy" onClick={()=>{setForm({playoffSize:"8",playoffDate:"",playoffTime:"09:00 AM",playoffLoc:"James J Walker"});setModal("genPlayoffs");}}>Generate Playoffs</Btn></div>}
      </div>}

      {tab==="bracket"&&season&&(()=>{try{
        const poGames=season.games.filter(g=>g.phase==="playoff"&&g.h&&g.a&&tm[g.h]&&tm[g.a]).sort((a,b)=>{const dd=new Date(a.date)-new Date(b.date);return dd!==0?dd:timeToMin(a.time)-timeToMin(b.time);});
        if(poGames.length===0) return <div><h2 style={{fontSize:20,margin:"0 0 20px",color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif",textAlign:"center"}}>🏆 Playoff Bracket</h2><Card><p style={{color:"#8892a4",textAlign:"center",margin:0}}>No playoff games yet. Generate them from the Standings tab.</p></Card></div>;
        let qf=[],sf=[],final_=[];
        const tagged=poGames.filter(g=>g.round);
        const untagged=poGames.filter(g=>!g.round);
        sf=tagged.filter(g=>g.round==="sf");
        final_=tagged.filter(g=>g.round==="final");
        qf=tagged.filter(g=>g.round==="qf");
        if(untagged.length>0){
          if(qf.length===0){qf=untagged;}
          else{untagged.forEach(g=>{if(sf.length<2&&qf.length>=4)sf.push(g);else if(final_.length<1&&sf.length>=2)final_.push(g);else qf.push(g);});}
        }
        const matchCard=(g,label)=>{if(!g)return null;const ho=tm[g.h],aw=tm[g.a];if(!ho||!aw)return null;const hWin=g.done&&(g.hs>g.as||(g.pks&&g.pkh>g.pka));const aWin=g.done&&(g.as>g.hs||(g.pks&&g.pka>g.pkh));
          return <div style={{background:"rgba(255,255,255,0.04)",border:g.done?"1px solid rgba(0,200,150,0.2)":"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"12px 14px",width:"100%"}}>
            {label&&<div style={{fontSize:10,color:"#8892a4",textTransform:"uppercase",fontWeight:700,letterSpacing:"0.05em",marginBottom:8}}>{label}</div>}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:"50%",background:ho.color}}/><span style={{fontSize:13,color:hWin?"#00C896":"#e8ecf4",fontWeight:hWin?700:400}}>{ho.name}</span></div>
              <span style={{fontSize:16,fontWeight:700,color:hWin?"#00C896":"#fff",minWidth:20,textAlign:"right"}}>{g.done?g.hs:"-"}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:"50%",background:aw.color}}/><span style={{fontSize:13,color:aWin?"#00C896":"#e8ecf4",fontWeight:aWin?700:400}}>{aw.name}</span></div>
              <span style={{fontSize:16,fontWeight:700,color:aWin?"#00C896":"#fff",minWidth:20,textAlign:"right"}}>{g.done?g.as:"-"}</span>
            </div>
            {g.pks&&<div style={{textAlign:"center",fontSize:10,color:"#FFB300",fontWeight:600,marginTop:6}}>({g.pkh}–{g.pka} PKs)</div>}
          </div>;};
        const placeholderCard=(label)=><div style={{background:"rgba(255,255,255,0.02)",border:"1px dashed rgba(255,179,0,0.2)",borderRadius:12,padding:"14px",width:"100%",textAlign:"center"}}><span style={{color:"#8892a4",fontSize:12}}>{label}</span></div>;
        const sectionTitle=(text)=><div style={{fontSize:12,fontWeight:700,color:"#FFB300",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10,marginTop:20,textAlign:"center"}}>{text}</div>;
        const leftQF=qf.length===4?[qf[0],qf[3]]:qf.slice(0,Math.ceil(qf.length/2));
        const rightQF=qf.length===4?[qf[1],qf[2]]:qf.slice(Math.ceil(qf.length/2));
        const leftSF=sf.length>=1?[sf[0]]:[];
        const rightSF=sf.length>=2?[sf[1]]:[];
        return <div>
          <h2 style={{fontSize:20,margin:"0 0 8px",color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif",textAlign:"center"}}>🏆 Playoff Bracket</h2>
          <div style={{fontSize:12,color:"#8892a4",textAlign:"center",marginBottom:20}}>{season.name}</div>
          {qf.length>0&&<>{sectionTitle("Quarter-Finals")}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{leftQF[0]&&<div>{matchCard(leftQF[0],"QF1")}</div>}{rightQF[0]&&<div>{matchCard(rightQF[0],"QF2")}</div>}{leftQF[1]&&<div>{matchCard(leftQF[1],"QF4")}</div>}{rightQF[1]&&<div>{matchCard(rightQF[1],"QF3")}</div>}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:4}}><div style={{textAlign:"center",fontSize:10,color:"#8892a4"}}> ↓ SF1</div><div style={{textAlign:"center",fontSize:10,color:"#8892a4"}}> ↓ SF2</div></div></>}
          {(sf.length>0||qf.length>2)&&<>{sectionTitle("Semi-Finals")}<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{leftSF.length>0?leftSF.map(g=><div key={g.id}>{matchCard(g,"SF1")}</div>):<div>{placeholderCard("Semi-Final 1")}</div>}{rightSF.length>0?rightSF.map(g=><div key={g.id}>{matchCard(g,"SF2")}</div>):<div>{placeholderCard("Semi-Final 2")}</div>}</div></>}
          {sectionTitle("Final")}
          <div style={{maxWidth:300,margin:"0 auto"}}>{final_.length>0?final_.map(g=><div key={g.id}>{matchCard(g,"Final")}</div>):placeholderCard("Final")}</div>
          <div style={{textAlign:"center",margin:"16px 0"}}><div style={{fontSize:48}}>🏆</div>
          {final_.length>0&&final_[0].done&&<div style={{color:"#FFB300",fontWeight:700,fontSize:16,marginTop:4,fontFamily:"'Bricolage Grotesque',sans-serif"}}>{(()=>{const g=final_[0];return g.hs>g.as?tm[g.h]?.name:g.as>g.hs?tm[g.a]?.name:"Draw";})()}</div>}</div>
        </div>;
      }catch(e){console.error("Bracket error:",e);return <div><h2 style={{fontSize:20,margin:"0 0 20px",color:"#fff",textAlign:"center"}}>🏆 Playoff Bracket</h2><Card><p style={{color:"#E63946",textAlign:"center",margin:0}}>Error loading bracket. Check console for details.</p></Card></div>;}})()}

      {tab==="schedule"&&season&&<div>
        <h2 style={{fontSize:20,margin:"0 0 16px",color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif"}}>Schedule — {season.name}</h2>
        <div style={{marginBottom:16}}><select value={teamFilter} onChange={e=>{setTeamFilter(e.target.value);}} style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid rgba(0,200,150,0.3)",background:"#1a1f2e",color:teamFilter?"#fff":"#8892a4",fontSize:14,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",appearance:"auto"}}><option value="">All Teams (or select a team)</option>{season.teams.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        {isAdmin&&<><ExcelUploadGames season={season} onImport={(gs,es)=>{updSeason(s=>({...s,games:[...s.games,...gs]}));flash(es.length?`Imported ${gs.length} games. Issues:\n${es.slice(0,10).join("\n")}${es.length>10?"\n...and "+(es.length-10)+" more":""}`:` Imported ${gs.length} games!`);}}/><div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}><Btn icon="plus" sz="sm" onClick={()=>{setForm({h:"",a:"",date:"",time:"",loc:"",phase:"group"});setModal("addGame");}}>Add Game</Btn></div></>}
        {(()=>{
          const allGames=teamFilter?season.games.filter(g=>g.h===teamFilter||g.a===teamFilter):season.games;
          const upcoming=allGames.filter(g=>!g.done).sort((a,b)=>{const dd=new Date(a.date)-new Date(b.date);return dd!==0?dd:timeToMin(a.time)-timeToMin(b.time);});
          const completed=allGames.filter(g=>g.done).sort((a,b)=>{const dd=new Date(b.date)-new Date(a.date);return dd!==0?dd:timeToMin(b.time)-timeToMin(a.time);});
          const upGrp=upcoming.filter(g=>(g.phase||"group")==="group");
          const upPo=upcoming.filter(g=>g.phase==="playoff"&&(isAdmin||g.h));
          const compGrp=completed.filter(g=>(g.phase||"group")==="group");
          const compPo=completed.filter(g=>g.phase==="playoff");
          const secStyle={fontSize:16,margin:"24px 0 12px",fontFamily:"'Bricolage Grotesque',sans-serif"};
          return <>{upcoming.length>0&&<><h3 style={{...secStyle,color:"#00C896"}}>Upcoming Games</h3>{upGrp.map(g=><GameCard key={g.id} g={g} admin={isAdmin}/>)}{upPo.length>0&&<><h4 style={{fontSize:14,margin:"16px 0 8px",color:"#FFB300"}}>🏆 Playoffs</h4>{upPo.map(g=><GameCard key={g.id} g={g} admin={isAdmin}/>)}</>}</>}
          {completed.length>0&&<><h3 style={{...secStyle,color:"#8892a4"}}>Completed Games</h3>{completed.map(g=><GameCard key={g.id} g={g} admin={isAdmin}/>)}</>}
          {allGames.length===0&&<Card><p style={{color:"#8892a4",textAlign:"center",margin:0}}>No games yet.</p></Card>}</>;})()}
      </div>}

      {tab==="rules"&&<div>
        <h2 style={{fontSize:20,margin:"0 0 16px",color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif"}}>Rules</h2>
        {isAdmin&&<div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>{modal==="editRules"?<div style={{display:"flex",gap:8}}><Btn sz="sm" icon="check" onClick={()=>{upd(d=>({...d,rules:form.rules}));setModal(null);}}>Save</Btn><Btn sz="sm" v="secondary" onClick={()=>setModal(null)}>Cancel</Btn></div>:<Btn sz="sm" icon="edit" onClick={()=>{setForm({rules:data.rules});setModal("editRules");}}>Edit</Btn>}</div>}
        {modal==="editRules"?<Inp ta value={form.rules} onChange={v=>setForm({...form,rules:v})}/>:<Card><pre style={{whiteSpace:"pre-wrap",color:"#c8d0e0",fontSize:14,lineHeight:1.7,fontFamily:"'DM Sans',sans-serif",margin:0}}>{data.rules}</pre></Card>}
      </div>}

      {tab==="teams"&&isAdmin&&season&&<div>
        <h2 style={{fontSize:20,margin:"0 0 16px",color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif"}}>Teams — {season.name}</h2>
        <ExcelUploadTeams existingNames={season.teams.map(t=>t.name)} onImport={(ts,es)=>{updSeason(s=>({...s,teams:[...s.teams,...ts]}));flash(es.length?`Imported ${ts.length} teams. ${es.length} issues.`:`Imported ${ts.length} teams!`);}}/><div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}><Btn icon="plus" sz="sm" onClick={()=>{setForm({name:"",color:"#00C896",capName:"",capEmail:"",group:(season?.groups||[]).length>0?"A":""});setModal("addTeam");}}>Add Team</Btn></div>
        {(season.groups||[]).length>0?(season.groups||[]).map(gr=><div key={gr}><h3 style={{fontSize:15,margin:"16px 0 10px",color:"#8892a4"}}>Group {gr}</h3><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12,marginBottom:16}}>{season.teams.filter(t=>t.group===gr).map(t=><Card key={t.id}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:14,height:14,borderRadius:"50%",background:t.color}}/><span style={{color:"#e8ecf4",fontWeight:700}}>{t.name}</span></div>{t.cap&&<div style={{fontSize:12,color:"#8892a4",marginBottom:8}}>Capt: {t.cap.name} · {t.cap.email}</div>}<div style={{display:"flex",gap:6}}><Btn sz="sm" v="ghost" icon="edit" onClick={()=>{setForm({tid:t.id,name:t.name,color:t.color,capName:t.cap?.name||"",capEmail:t.cap?.email||"",group:t.group||"A"});setModal("editTeam");}}>Edit</Btn><Btn sz="sm" v="ghost" icon="trash" onClick={()=>{updSeason(s=>({...s,teams:s.teams.filter(x=>x.id!==t.id)}));}} style={{color:"#E63946"}}>Del</Btn></div></Card>)}</div></div>)
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12,marginBottom:16}}>{season.teams.map(t=><Card key={t.id}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:14,height:14,borderRadius:"50%",background:t.color}}/><span style={{color:"#e8ecf4",fontWeight:700}}>{t.name}</span></div>{t.cap&&<div style={{fontSize:12,color:"#8892a4",marginBottom:8}}>Capt: {t.cap.name} · {t.cap.email}</div>}<div style={{display:"flex",gap:6}}><Btn sz="sm" v="ghost" icon="edit" onClick={()=>{setForm({tid:t.id,name:t.name,color:t.color,capName:t.cap?.name||"",capEmail:t.cap?.email||"",group:""});setModal("editTeam");}}>Edit</Btn><Btn sz="sm" v="ghost" icon="trash" onClick={()=>{updSeason(s=>({...s,teams:s.teams.filter(x=>x.id!==t.id)}));}} style={{color:"#E63946"}}>Del</Btn></div></Card>)}</div>}
      </div>}

      {tab==="invites"&&isAdmin&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h2 style={{fontSize:20,margin:0,color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif"}}>Invites</h2><div style={{display:"flex",gap:8}}><Btn icon="dl" sz="sm" v="secondary" onClick={exportInvites}>Export</Btn><Btn icon="send" sz="sm" onClick={()=>{setForm({email:"",team:"",role:"captain"});setModal("invite");}}>Invite</Btn></div></div>
        <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}><Card style={{flex:1,minWidth:120,textAlign:"center"}}><div style={{fontSize:28,fontWeight:700,color:"#00C896"}}>{data.invites.filter(i=>i.status==="accepted").length}</div><div style={{fontSize:12,color:"#8892a4"}}>Accepted</div></Card><Card style={{flex:1,minWidth:120,textAlign:"center"}}><div style={{fontSize:28,fontWeight:700,color:"#F4A261"}}>{data.invites.filter(i=>i.status==="pending").length}</div><div style={{fontSize:12,color:"#8892a4"}}>Pending</div></Card></div>
        {data.invites.map((inv,i)=><Card key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}><div><div style={{color:"#e8ecf4",fontWeight:600}}>{inv.email}</div><div style={{fontSize:12,color:"#8892a4"}}>{inv.team} · {inv.role} · {inv.sent}</div></div><div style={{display:"flex",gap:8,alignItems:"center"}}><Badge c={inv.status==="accepted"?"#00C896":"#F4A261"}>{inv.status}</Badge><Btn sz="sm" v="ghost" onClick={()=>upd(d=>({...d,invites:d.invites.map((x,j)=>j===i?{...x,status:x.status==="pending"?"accepted":"pending"}:x)}))}>{inv.status==="pending"?"Accept":"Undo"}</Btn><Btn sz="sm" v="ghost" icon="trash" onClick={()=>upd(d=>({...d,invites:d.invites.filter((_,j)=>j!==i)}))} style={{color:"#E63946"}}/></div></div></Card>)}
      </div>}

      {tab==="email"&&isAdmin&&<div>
        <h2 style={{fontSize:20,margin:"0 0 20px",color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif"}}>Send Email</h2>
        <Card><Sel label="To" value={form.emailTo||"all"} onChange={v=>setForm({...form,emailTo:v})} opts={[{v:"all",l:"All Players"},{v:"captains",l:"All Captains"},...(season?.teams.map(t=>({v:t.id,l:`${t.name} Capt`}))||[])]}/>
        <Inp label="Subject" value={form.emailSubj||""} onChange={v=>setForm({...form,emailSubj:v})} ph="Subject..."/>
        <Inp label="Message" ta value={form.emailBody||""} onChange={v=>setForm({...form,emailBody:v})} ph="Message..."/>
        <Btn icon="send" onClick={()=>{const to=form.emailTo||"all";const r=to==="captains"?season?.teams.filter(t=>t.cap?.email).map(t=>t.cap.email)||[]:to==="all"?data.invites.filter(i=>i.status==="accepted").map(i=>i.email):(()=>{const t=season?.teams.find(t=>t.id===to);return t?.cap?.email?[t.cap.email]:[];})();if(!r.length)return alert("No recipients");gmailCompose(r.join(","),form.emailSubj||"",form.emailBody||"");}} disabled={!form.emailSubj}>Open in Gmail</Btn></Card>
      </div>}

      {tab==="settings"&&isAdmin&&<div>
        <h2 style={{fontSize:20,margin:"0 0 20px",color:"#fff",fontFamily:"'Bricolage Grotesque',sans-serif"}}>Settings</h2>
        <Card style={{marginBottom:16}}><div style={{fontWeight:700,color:"#e8ecf4",marginBottom:14}}>App URL</div><Inp label="URL" value={data.appUrl||""} onChange={v=>upd(d=>({...d,appUrl:v}))} ph="https://..."/></Card>
        <Card style={{marginBottom:16}}><div style={{fontWeight:700,color:"#e8ecf4",marginBottom:14}}>Invite Template</div><p style={{fontSize:12,color:"#8892a4",margin:"0 0 10px"}}>Use: {"{{team}} {{role}} {{link}}"}</p><Inp label="Subject" value={data.inviteTemplate?.subject||""} onChange={v=>upd(d=>({...d,inviteTemplate:{...d.inviteTemplate,subject:v}}))}/><Inp label="Body" ta value={data.inviteTemplate?.body||""} onChange={v=>upd(d=>({...d,inviteTemplate:{...d.inviteTemplate,body:v}}))}/></Card>
        <Card><div style={{fontWeight:700,color:"#e8ecf4",marginBottom:14}}>Admin Password</div><Inp label="Password" value={data.adminPw} onChange={v=>upd(d=>({...d,adminPw:v}))}/></Card>
        <Card style={{marginTop:16}}><div style={{fontWeight:700,color:"#e8ecf4",marginBottom:14}}>Export Data</div><p style={{fontSize:12,color:"#8892a4",margin:"0 0 12px"}}>Download a full backup of all league data (active seasons, settings, rules).</p><Btn icon="dl" onClick={()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`soccerheights-backup-${new Date().toISOString().split("T")[0]}.json`;a.click();URL.revokeObjectURL(url);}}>Export JSON Backup</Btn></Card>
      </div>}
    </div>

    <Modal open={modal==="newSeason"} onClose={()=>setModal(null)} title="New Season"><Inp label="Name" value={form.name||""} onChange={v=>setForm({...form,name:v})} ph="e.g., Spring 2026"/><Inp label="Start" type="date" value={form.start||""} onChange={v=>setForm({...form,start:v})}/><Inp label="End" type="date" value={form.end||""} onChange={v=>setForm({...form,end:v})}/><Sel label="Format" value={form.format||"groups"} onChange={v=>setForm({...form,format:v})} opts={[{v:"groups",l:"Group A & B"},{v:"single",l:"Single Table (Round Robin)"}]}/><Btn onClick={()=>{if(!form.name)return;upd(d=>({...d,seasons:[...d.seasons,{id:`s${Date.now()}`,name:form.name,status:"planning",start:form.start,end:form.end,teams:[],games:[],groups:form.format==='single'?[]:['A','B']}]}));setModal(null);}} disabled={!form.name}>Create</Btn></Modal>

    <Modal open={modal==="addTeam"} onClose={()=>setModal(null)} title="Add Team"><Inp label="Name" value={form.name||""} onChange={v=>setForm({...form,name:v})}/><div style={{marginBottom:14}}><label style={{display:"block",fontSize:12,color:"#8892a4",marginBottom:5,fontWeight:600,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Color</label><input type="color" value={form.color||"#00C896"} onChange={e=>setForm({...form,color:e.target.value})} style={{width:50,height:36,border:"none",borderRadius:8,cursor:"pointer",background:"transparent"}}/></div>{(season?.groups||[]).length>0&&<Sel label="Group" value={form.group||"A"} onChange={v=>setForm({...form,group:v})} opts={(season?.groups||[]).map(g=>({v:g,l:`Group ${g}`}))}/>}<Inp label="Captain Name" value={form.capName||""} onChange={v=>setForm({...form,capName:v})}/><Inp label="Captain Email" value={form.capEmail||""} onChange={v=>setForm({...form,capEmail:v})}/><Btn onClick={()=>{if(!form.name)return;updSeason(s=>({...s,teams:[...s.teams,{id:`t${Date.now()}`,name:form.name,color:form.color||"#00C896",cap:form.capName?{name:form.capName,email:form.capEmail}:null,group:(season?.groups||[]).length>0?(form.group||"A"):""}]}));setModal(null);}}>Add</Btn></Modal>

    <Modal open={modal==="editTeam"} onClose={()=>setModal(null)} title="Edit Team"><Inp label="Name" value={form.name||""} onChange={v=>setForm({...form,name:v})}/><div style={{marginBottom:14}}><label style={{display:"block",fontSize:12,color:"#8892a4",marginBottom:5,fontWeight:600,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Color</label><input type="color" value={form.color||"#00C896"} onChange={e=>setForm({...form,color:e.target.value})} style={{width:50,height:36,border:"none",borderRadius:8,cursor:"pointer",background:"transparent"}}/></div>{(season?.groups||[]).length>0&&<Sel label="Group" value={form.group||"A"} onChange={v=>setForm({...form,group:v})} opts={(season?.groups||[]).map(g=>({v:g,l:`Group ${g}`}))}/>}<Inp label="Captain Name" value={form.capName||""} onChange={v=>setForm({...form,capName:v})}/><Inp label="Captain Email" value={form.capEmail||""} onChange={v=>setForm({...form,capEmail:v})}/><Btn onClick={()=>{updSeason(s=>({...s,teams:s.teams.map(t=>t.id===form.tid?{...t,name:form.name,color:form.color,cap:form.capName?{name:form.capName,email:form.capEmail}:null,group:form.group}:t)}));setModal(null);}}>Save</Btn></Modal>

    <Modal open={modal==="addGame"} onClose={()=>setModal(null)} title="Add Game"><Sel label="Home" value={form.h||""} onChange={v=>setForm({...form,h:v})} opts={teamOpts}/><Sel label="Away" value={form.a||""} onChange={v=>setForm({...form,a:v})} opts={teamOpts.filter(o=>o.v!==form.h)}/><Inp label="Date" type="date" value={form.date||""} onChange={v=>setForm({...form,date:v})}/><Inp label="Time" value={form.time||""} onChange={v=>setForm({...form,time:v})} ph="10:00 AM"/><Sel label="Field" value={form.loc||""} onChange={v=>setForm({...form,loc:v})} opts={FIELDS.map(f=>({v:f,l:f}))}/><Inp label="Duration (minutes)" type="number" value={form.duration||""} onChange={v=>setForm({...form,duration:v})} ph="70"/><Sel label="Phase" value={form.phase||"group"} onChange={v=>setForm({...form,phase:v,round:""})} opts={[{v:"group",l:"Group"},{v:"playoff",l:"Playoff"}]}/>{form.phase==="playoff"&&<Sel label="Round" value={form.round||""} onChange={v=>setForm({...form,round:v})} opts={[{v:"qf",l:"Quarter-Final"},{v:"sf",l:"Semi-Final"},{v:"final",l:"Final"}]}/>}<Btn onClick={()=>{if(!form.h||!form.a||!form.date)return;if(form.phase==="playoff"&&!form.round)return;updSeason(s=>({...s,games:[...s.games,{id:`g${Date.now()}`,h:form.h,a:form.a,date:form.date,time:form.time||"",loc:form.loc||"",duration:form.duration?parseInt(form.duration):null,hs:null,as:null,done:false,phase:form.phase||"group",round:form.round||null,videoUrl:""}]}));setModal(null);}}>Add</Btn></Modal>

    <Modal open={modal==="score"} onClose={()=>setModal(null)} title="Enter Score">{form.gid&&<><div style={{textAlign:"center",marginBottom:16,fontSize:15,color:"#e8ecf4",fontWeight:600}}>{tm[form.h]?.name} vs {tm[form.a]?.name}</div><div style={{display:"flex",gap:12}}><Inp label={tm[form.h]?.name||"Home"} type="number" value={form.hs??""} onChange={v=>setForm({...form,hs:v})} ph="0"/><Inp label={tm[form.a]?.name||"Away"} type="number" value={form.as??""} onChange={v=>setForm({...form,as:v})} ph="0"/></div><div style={{display:"flex",alignItems:"center",gap:8,margin:"12px 0"}}><input type="checkbox" id="forfeit-check" checked={!!form.forfeit} onChange={e=>setForm({...form,forfeit:e.target.checked})} style={{width:18,height:18,accentColor:"#E63946",cursor:"pointer"}}/><label htmlFor="forfeit-check" style={{color:"#e8ecf4",fontSize:13,cursor:"pointer"}}>Forfeit <span style={{color:"#E63946",fontWeight:700}}>(F)</span></label></div>{form.hs!==""&&form.as!==""&&form.hs===form.as&&<><div style={{display:"flex",alignItems:"center",gap:8,margin:"12px 0"}}><input type="checkbox" id="pks-check" checked={!!form.pks} onChange={e=>setForm({...form,pks:e.target.checked,pkh:"",pka:""})} style={{width:18,height:18,accentColor:"#FFB300",cursor:"pointer"}}/><label htmlFor="pks-check" style={{color:"#e8ecf4",fontSize:13,cursor:"pointer"}}>Went to PKs? <span style={{color:"#FFB300",fontWeight:700}}>⚽</span></label></div>{form.pks&&<div style={{display:"flex",gap:12}}><Inp label={`${tm[form.h]?.name||"Home"} PKs`} type="number" value={form.pkh??""} onChange={v=>setForm({...form,pkh:v})} ph="0"/><Inp label={`${tm[form.a]?.name||"Away"} PKs`} type="number" value={form.pka??""} onChange={v=>setForm({...form,pka:v})} ph="0"/></div>}</>}<Inp label="Video URL (optional)" value={form.videoUrl||""} onChange={v=>setForm({...form,videoUrl:v})} ph="https://app.veo.co/..."/><Btn onClick={()=>{if(form.hs===""||form.as==="")return;if(form.pks&&(form.pkh===""||form.pka===""))return;const sy=window.scrollY;updSeason(s=>({...s,games:s.games.map(g=>g.id===form.gid?{...g,hs:parseInt(form.hs),as:parseInt(form.as),done:true,videoUrl:form.videoUrl||"",forfeit:!!form.forfeit,pks:!!form.pks,pkh:form.pks?parseInt(form.pkh):null,pka:form.pks?parseInt(form.pka):null}:g)}));setModal(null);setTimeout(()=>window.scrollTo(0,sy),100);}}>Save</Btn></>}</Modal>

    <Modal open={modal==="editGame"} onClose={()=>setModal(null)} title="Edit Game"><Sel label="Home" value={form.h||""} onChange={v=>setForm({...form,h:v})} opts={teamOpts}/><Sel label="Away" value={form.a||""} onChange={v=>setForm({...form,a:v})} opts={teamOpts}/><Inp label="Date" type="date" value={form.date||""} onChange={v=>setForm({...form,date:v})}/><Inp label="Time" value={form.time||""} onChange={v=>setForm({...form,time:v})}/><Sel label="Field" value={form.loc||""} onChange={v=>setForm({...form,loc:v})} opts={FIELDS.map(f=>({v:f,l:f}))}/><Inp label="Duration (minutes)" type="number" value={form.duration||""} onChange={v=>setForm({...form,duration:v})} ph="70"/><Sel label="Phase" value={form.phase||"group"} onChange={v=>setForm({...form,phase:v,round:v==="group"?"":form.round})} opts={[{v:"group",l:"Group"},{v:"playoff",l:"Playoff"}]}/>{form.phase==="playoff"&&<Sel label="Round" value={form.round||""} onChange={v=>setForm({...form,round:v})} opts={[{v:"qf",l:"Quarter-Final"},{v:"sf",l:"Semi-Final"},{v:"final",l:"Final"}]}/>}<Btn onClick={()=>{const sy=window.scrollY;updSeason(s=>({...s,games:s.games.map(g=>g.id===form.gid?{...g,h:form.h,a:form.a,date:form.date,time:form.time,loc:form.loc,duration:form.duration?parseInt(form.duration):null,phase:form.phase,round:form.round||null}:g)}));setModal(null);setTimeout(()=>window.scrollTo(0,sy),100);}}>Save</Btn></Modal>

    <Modal open={modal==="video"} onClose={()=>setModal(null)} title="Game Video Link"><Inp label="Video URL" value={form.videoUrl||""} onChange={v=>setForm({...form,videoUrl:v})} ph="https://app.veo.co/..."/><Btn onClick={()=>{const sy=window.scrollY;updSeason(s=>({...s,games:s.games.map(g=>g.id===form.gid?{...g,videoUrl:form.videoUrl||""}:g)}));setModal(null);setTimeout(()=>window.scrollTo(0,sy),100);}}>Save</Btn></Modal>

    <Modal open={modal==="invite"} onClose={()=>setModal(null)} title="Send Invite"><Inp label="Email" value={form.email||""} onChange={v=>setForm({...form,email:v})} ph="player@email.com"/><Inp label="Team" value={form.team||""} onChange={v=>setForm({...form,team:v})}/><Sel label="Role" value={form.role||"captain"} onChange={v=>setForm({...form,role:v})} opts={[{v:"captain",l:"Captain"},{v:"player",l:"Player"}]}/><Btn icon="send" onClick={()=>{if(!form.email)return;upd(d=>({...d,invites:[...d.invites,{email:form.email,team:form.team,role:form.role||"captain",status:"pending",sent:new Date().toISOString().split("T")[0]}]}));const{subj,body}=buildInvite(form.email,form.team,form.role);gmailCompose(form.email,subj,body);setModal(null);}} disabled={!form.email}>Send</Btn></Modal>

    <Modal open={modal==="genPlayoffs"} onClose={()=>setModal(null)} title="Generate Playoffs">{(()=>{
      const allGroups=(season?.groups||["A","B"]);
      const allStandings=allGroups.flatMap(g=>calcStandings(season,g));
      allStandings.sort((a,b)=>b.pts!==a.pts?b.pts-a.pts:b.gd!==a.gd?b.gd-a.gd:b.gf-a.gf);
      const size=parseInt(form.playoffSize)||8;
      const qualified=allStandings.slice(0,size);
      const matchups=[];
      if(size===8){matchups.push([qualified[0],qualified[7]],[qualified[1],qualified[6]],[qualified[2],qualified[5]],[qualified[3],qualified[4]]);}
      else if(size===6){matchups.push([qualified[0],qualified[3]],[qualified[1],qualified[2]],[qualified[4],qualified[5]]);}
      else if(size===4){matchups.push([qualified[0],qualified[3]],[qualified[1],qualified[2]]);}
      return <><Sel label="Playoff Size" value={form.playoffSize||"8"} onChange={v=>setForm({...form,playoffSize:v})} opts={[{v:"4",l:"4 Teams (Semis)"},{v:"6",l:"6 Teams"},{v:"8",l:"8 Teams (Quarter-Finals)"}]}/>
      <div style={{margin:"16px 0"}}><div style={{fontSize:13,fontWeight:700,color:"#FFB300",marginBottom:10}}>Seedings</div>
      {qualified.map((t,i)=><div key={t.team.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",fontSize:13,color:"#e8ecf4"}}><span style={{color:"#FFB300",fontWeight:700,width:20}}>{i+1}</span><div style={{width:10,height:10,borderRadius:"50%",background:t.team.color}}/><span>{t.team.name}</span><span style={{color:"#8892a4",marginLeft:"auto"}}>{t.pts}pts, {t.gd>0?"+":""}{t.gd}gd</span></div>)}</div>
      <div style={{margin:"16px 0"}}><div style={{fontSize:13,fontWeight:700,color:"#00C896",marginBottom:10}}>Matchups</div>
      {matchups.map((m,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",fontSize:13,color:"#e8ecf4",borderBottom:"1px solid rgba(255,255,255,0.04)"}}><span style={{color:"#8892a4",width:30}}>QF{i+1}</span><div style={{width:10,height:10,borderRadius:"50%",background:m[0]?.team.color}}/><span style={{fontWeight:600}}>{m[0]?.team.name}</span><span style={{color:"#8892a4",margin:"0 6px"}}>vs</span><div style={{width:10,height:10,borderRadius:"50%",background:m[1]?.team.color}}/><span style={{fontWeight:600}}>{m[1]?.team.name}</span></div>)}</div>
      <Inp label="Date" type="date" value={form.playoffDate||""} onChange={v=>setForm({...form,playoffDate:v})}/>
      <Inp label="Start Time" value={form.playoffTime||"09:00 AM"} onChange={v=>setForm({...form,playoffTime:v})} ph="09:00 AM"/>
      <Inp label="Location" value={form.playoffLoc||""} onChange={v=>setForm({...form,playoffLoc:v})}/>
      <Btn onClick={()=>{if(!form.playoffDate)return;const games=matchups.map((m,i)=>{const baseMin=timeToMin(form.playoffTime||"09:00 AM")+i*45;const h=Math.floor(baseMin/60);const mn=baseMin%60;const ampm=h>=12?"PM":"AM";const h12=h>12?h-12:h===0?12:h;const timeStr=`${h12}:${String(mn).padStart(2,"0")} ${ampm}`;return{id:`po${Date.now()}-${i}`,h:m[0]?.team.id,a:m[1]?.team.id,date:form.playoffDate,time:timeStr,loc:form.playoffLoc||"",hs:null,as:null,done:false,phase:"playoff",round:"qf",videoUrl:""};});updSeason(s=>({...s,games:[...s.games,...games]}));flash(`Generated ${games.length} playoff games!`);setModal(null);}}>Generate {matchups.length} Games</Btn></>;
    })()}</Modal>
  </div>;
}
